(function () {
  'use strict';
  const fallback = 'No additional state-specific instructions are listed in your OPID reference. Check the current issuing-office application.';
  const staffDefault = 'Staff-reference instructions: confirm current ID acceptance and processing times with the issuing office.';
  // Keep the existing full-name dropdown; use postal codes only for database lookups.
  const names = ['Texas','Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','American Samoa','Guam','Northern Mariana Islands','Puerto Rico','U.S. Virgin Islands'];
  const codes = 'TX AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN UT VT VA WA WV WI WY AS GU MP PR VI'.split(' ');
  const states = Object.freeze(Object.fromEntries(names.map((name, i) => [name, codes[i]])));
  let currentName, currentNode, requestId = 0, rule = null;

  function instruction(row, name, county, nyc) {
    if (!row || !row.active) return fallback;
    let value = row.special_instruction;
    if (name === 'Illinois' && /cook/i.test(county)) value = row.instruction_overrides?.cook_county ?? value;
    if (name === 'New York' && nyc === 'yes') value = row.instruction_overrides?.nyc ?? value;
    return typeof value === 'string' && value.trim() ? value : fallback;
  }
  function paint() {
    const node = document.querySelector('#special');
    if (!node || node !== currentNode) return;
    node.textContent = instruction(rule, currentName, document.querySelector('#county')?.value || '', document.querySelector('#nyc')?.value);
    const staff = document.querySelector('#special-staff');
    if (staff) staff.textContent = rule?.staff_note?.trim() ? rule.staff_note : staffDefault;
  }
  async function update(name) {
    const node = document.querySelector('#special');
    if (!node) return;
    // County/NYC changes reuse the selected state's response without a request per keystroke.
    if (currentName === name && currentNode === node) { paint(); return; }
    currentName = name; currentNode = node; rule = null;
    const id = ++requestId;
    paint();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const config = window.OPID_CONFIG;
      if (!config?.url || !config?.publicKey || !states[name]) throw new Error('Configuration or state mapping missing');
      const query = new URLSearchParams({state_code: 'eq.' + states[name], active: 'eq.true', select: 'special_instruction,staff_note,source_url,last_verified,active,instruction_overrides', limit: '1'});
      const response = await fetch(config.url + '/rest/v1/state_rules?' + query, {
        headers: {apikey: config.publicKey}, signal: controller.signal, cache: 'no-store'
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Invalid rules response');
      if (id === requestId) { rule = rows[0] || null; paint(); }
    } catch (error) {
      console.warn('OPID state instructions unavailable:', error.name === 'AbortError' ? 'request timed out' : error.message);
      if (id === requestId) { rule = null; paint(); }
    } finally { clearTimeout(timeout); }
  }
  window.OPID_RULES = Object.freeze({update, states, instruction, fallback, staffDefault});
}());
