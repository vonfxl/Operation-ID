-- Stage A: editable instruction content only. No frontend business logic changes.
begin;

create table public.state_rules (
  id uuid primary key default gen_random_uuid(),
  state_code text not null unique,
  state_name text not null unique,
  special_instruction text,
  staff_note text,
  source_url text,
  last_verified date,
  active boolean not null default true,
  instruction_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint state_rules_code_format check (state_code ~ '^[A-Z]{2}$'),
  constraint state_rules_name_format check (
    state_name = btrim(state_name) and length(state_name) > 0
  ),
  -- Only the two existing UI branches are supported; no arbitrary jurisdictions.
  constraint state_rules_known_overrides check (
    instruction_overrides = '{}'::jsonb
    or (
      state_code = 'IL' and state_name = 'Illinois'
      and jsonb_typeof(instruction_overrides) = 'object'
      and instruction_overrides ? 'cook_county'
      and instruction_overrides - 'cook_county' = '{}'::jsonb
      and jsonb_typeof(instruction_overrides -> 'cook_county') = 'string'
    )
    or (
      state_code = 'NY' and state_name = 'New York'
      and jsonb_typeof(instruction_overrides) = 'object'
      and instruction_overrides ? 'nyc'
      and instruction_overrides - 'nyc' = '{}'::jsonb
      and jsonb_typeof(instruction_overrides -> 'nyc') = 'string'
    )
  )
);

-- Unique constraints already provide the lookup indexes needed for 56 rows.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create function public.set_state_rules_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

create trigger state_rules_updated_at
before update on public.state_rules
for each row execute function public.set_state_rules_updated_at();

alter table public.state_rules enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.state_rules from public, anon, authenticated;
revoke all on public.admin_users from public, anon, authenticated;
revoke all on function public.set_state_rules_updated_at() from public, anon, authenticated;

grant select on public.state_rules to anon, authenticated;
grant insert, update, delete on public.state_rules to authenticated;
grant select on public.admin_users to authenticated;

-- Membership is provisioned by the project owner in the Supabase SQL Editor.
-- No client role can insert/update/delete its own or anyone else's membership.
create policy admin_users_read_own_membership
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

create policy state_rules_read_active
on public.state_rules for select to anon, authenticated
using (active = true);

create policy state_rules_admin_select
on public.state_rules for select to authenticated
using (exists (
  select 1 from public.admin_users where user_id = (select auth.uid())
));

create policy state_rules_admin_insert
on public.state_rules for insert to authenticated
with check (exists (
  select 1 from public.admin_users where user_id = (select auth.uid())
));

create policy state_rules_admin_update
on public.state_rules for update to authenticated
using (exists (
  select 1 from public.admin_users where user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.admin_users where user_id = (select auth.uid())
));

create policy state_rules_admin_delete
on public.state_rules for delete to authenticated
using (exists (
  select 1 from public.admin_users where user_id = (select auth.uid())
));

commit;
