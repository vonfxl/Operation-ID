(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const message = (text, type = '') => { $('status').textContent = text; $('status').className = type; };
  if (!window.supabase || !window.OPID_CONFIG || !window.OPID_RULES) {
    message('The sign-in service could not load. Please reload the page.', 'error'); return;
  }
  const client = window.supabase.createClient(OPID_CONFIG.url, OPID_CONFIG.publicKey, {
    auth: {persistSession: true, storage: window.sessionStorage, storageKey: 'opid-admin-auth', detectSessionInUrl: false},
    global: {fetch: (url, options = {}) => fetch(url, {...options, signal: options.signal || AbortSignal.timeout(15000)})}
  });
  let rows = [], editing = null, busy = false, authorized = false, revision = 0;
  const states = OPID_RULES.states;
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const review = date => !date ? 'Not verified' : (Date.parse(today() + 'T00:00:00Z') - Date.parse(date + 'T00:00:00Z')) / 86400000 > 90 ? 'Needs review' : '';
  const dateLabel = date => date ? `${date.slice(5,7)}/${date.slice(8,10)}/${date.slice(0,4)}` : '—';
  const optional = value => value.trim() ? value : null;
  function lock(value) {
    busy = value;
    document.querySelectorAll('button, #editor input, #editor select, #editor textarea').forEach(el => el.disabled = value);
  }
  function closeEditor() { editing = null; $('editor').hidden = true; }
  function clearDashboard() { authorized = false; rows = []; closeEditor(); $('rules').replaceChildren(); $('dashboard').hidden = true; }
  async function requireAdmin() {
    const {data, error} = await client.auth.getUser();
    if (error || !data.user) throw new Error('Please sign in again.');
    const membership = await client.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (membership.error) throw new Error('Unable to verify admin access. Please retry.');
    if (!membership.data) throw new Error('This account is not an authorized admin. Ask the project owner to grant access.');
  }
  function render() {
    $('rules').replaceChildren();
    const search = $('search').value.toLowerCase().trim();
    for (const row of rows.filter(r => `${r.state_name} ${r.state_code}`.toLowerCase().includes(search))) {
      const tr = document.createElement('tr');
      const values = [row.state_name, row.state_code, row.special_instruction || 'No special instruction', dateLabel(row.last_verified), row.updated_at ? new Date(row.updated_at).toLocaleString() : '—', row.active ? 'Yes' : 'No'];
      values.forEach((value, i) => { const td = document.createElement('td'); td.textContent = i === 2 && value.length > 130 ? value.slice(0,130) + '…' : value; if(i === 2) td.className = 'preview'; if(i === 3 && review(row.last_verified)) { const flag = document.createElement('div'); flag.className = 'review'; flag.textContent = review(row.last_verified); td.append(flag); } tr.append(td); });
      const actions = document.createElement('td');
      for (const [label, action] of [['Edit', () => edit(row)], ['Mark verified today', () => verify(row)]]) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'quiet'; button.textContent = label; button.disabled = busy; button.onclick = action; actions.append(button);
      }
      tr.append(actions); $('rules').append(tr);
    }
  }
  function overrideField() {
    const name = $('state-name').value;
    $('override-field').hidden = name !== 'Illinois' && name !== 'New York';
    $('override-label').textContent = name === 'Illinois' ? 'Cook County instruction' : 'NYC instruction';
  }
  function edit(row) {
    if (busy) return;
    editing = row;
    $('edit-title').textContent = 'Edit ' + row.state_name;
    $('state-name').value = row.state_name; $('state-code').value = row.state_code;
    $('instruction').value = row.special_instruction ?? ''; $('staff-note').value = row.staff_note ?? '';
    $('source-url').value = row.source_url ?? ''; $('last-verified').value = row.last_verified ?? '';
    $('active').checked = row.active;
    $('override').value = row.instruction_overrides?.cook_county ?? row.instruction_overrides?.nyc ?? '';
    $('updated').textContent = 'Last updated: ' + new Date(row.updated_at).toLocaleString();
    overrideField(); $('editor').hidden = false; $('editor').scrollIntoView({block:'start',behavior:'smooth'}); $('instruction').focus();
  }
  async function loadRows() {
    const {data, error} = await client.from('state_rules').select('*').order('state_name');
    if (error) throw new Error('Could not load state rules. Check your connection and admin access.');
    rows = data; render();
  }
  async function refreshAccess() {
    const id = ++revision;
    clearDashboard();
    const {data, error} = await client.auth.getSession();
    if (id !== revision) return;
    $('login-panel').hidden = !!data.session; $('logout').hidden = !data.session;
    if (error || !data.session) { message('Sign in to manage state instructions.'); return; }
    try {
      await requireAdmin();
      if (id !== revision) return;
      authorized = true; await loadRows();
      if (id !== revision) { clearDashboard(); return; }
      $('dashboard').hidden = false; message('Signed in. Select a state to edit.');
    } catch (error) { if (id === revision) { clearDashboard(); message(error.message, 'error'); } }
  }
  async function saveRow(row, changes) {
    await requireAdmin();
    // Avoid silently overwriting another editor's changes.
    const {data, error} = await client.from('state_rules').update(changes).eq('id', row.id).eq('updated_at', row.updated_at).select('*');
    if (error) throw new Error(error.code === '23505' ? 'That state or code already exists. Select its existing record.' : 'Save failed. Check the fields, connection, and admin access, then retry.');
    if (data.length !== 1) throw new Error('This record changed or access was revoked. Refresh the list before editing again.');
    rows = rows.map(r => r.id === row.id ? data[0] : r); render();
  }
  async function verify(row) {
    if (busy) return;
    if (editing) { message('Save or cancel the open edit before marking a record verified.', 'error'); return; }
    lock(true);
    try { await saveRow(row, {last_verified: today()}); message(row.state_name + ' marked verified today. Instruction text was unchanged.', 'success'); }
    catch (error) { message(error.message, 'error'); }
    finally { lock(false); }
  }
  $('login').onsubmit = async event => {
    event.preventDefault(); if (busy) return; lock(true); message('Signing in…');
    try {
      const {error} = await client.auth.signInWithPassword({email: $('email').value.trim(), password: $('password').value});
      $('password').value = '';
      if (error) throw new Error('Sign-in failed. Check your email/password and connection.');
      await refreshAccess();
    } catch (error) { message(error.message, 'error'); }
    finally { lock(false); }
  };
  $('logout').onclick = async () => {
    if (busy) return; lock(true);
    try { const {error} = await client.auth.signOut({scope:'local'}); if (error) throw error; clearDashboard(); await refreshAccess(); message('You are logged out.'); }
    catch (_) { clearDashboard(); message('Logout could not be confirmed. Retry, or close this tab to clear its session.', 'error'); }
    finally { lock(false); }
  };
  $('editor').onsubmit = async event => {
    event.preventDefault(); if (busy || !editing || !authorized) return;
    const name = $('state-name').value, source = optional($('source-url').value.trim());
    if (source && !/^https?:\/\//i.test(source)) { message('Source URL must start with https:// or http://.', 'error'); return; }
    const overrides = {};
    if (optional($('override').value) && (name === 'Illinois' || name === 'New York')) overrides[name === 'Illinois' ? 'cook_county' : 'nyc'] = $('override').value;
    const changes = {state_name:name, state_code:states[name], special_instruction:optional($('instruction').value), staff_note:optional($('staff-note').value), source_url:source, last_verified:$('last-verified').value || null, active:$('active').checked, instruction_overrides:overrides};
    lock(true);
    try { await saveRow(editing, changes); closeEditor(); message('Changes saved. The public guide will read them when the state is selected again or the page is reloaded.', 'success'); }
    catch (error) { message(error.message, 'error'); }
    finally { lock(false); }
  };
  for (const [name, code] of Object.entries(states).sort()) { $('state-name').add(new Option(name, name)); $('state-code').add(new Option(code, code)); }
  $('state-name').onchange = () => { $('state-code').value = states[$('state-name').value]; $('override').value = ''; overrideField(); };
  $('state-code').onchange = () => { $('state-name').value = Object.keys(states).find(name => states[name] === $('state-code').value); $('override').value = ''; overrideField(); };
  $('cancel').onclick = closeEditor;
  $('search').oninput = render;
  $('refresh').onclick = async () => { if(busy) return; lock(true); closeEditor(); try { await refreshAccess(); } finally { lock(false); } };
  // Do not await another auth call from inside the SDK's auth callback.
  client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') { ++revision; clearDashboard(); $('login-panel').hidden = false; $('logout').hidden = true; message('You are logged out.'); } });
  refreshAccess().catch(() => message('Unable to check your session. Reload to retry.', 'error'));
}());
