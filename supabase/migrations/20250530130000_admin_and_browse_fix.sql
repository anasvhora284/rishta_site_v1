-- Fix admin JWT check + hide test/internal profiles from public browse

alter table profiles
  add column if not exists is_test boolean not null default false;

-- Broader admin detection (app_metadata or user_metadata on JWT)
create or replace function is_admin()
returns boolean as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$ language sql stable security definer set search_path = public;

-- Public browse: approved matrimonial profiles only (not test rows)
drop policy if exists "Public read approved profiles" on profiles;

create policy "Public read approved profiles"
  on profiles for select
  using (status = 'approved' and is_test = false);

-- Mark obvious E2E / test submissions (safe to re-run)
update profiles
set is_test = true
where
  name ilike '%e2e%'
  or name ilike '%test vhora%'
  or coalesce(admin_notes, '') ilike '%e2e%';

create index if not exists profiles_browse_idx on profiles (status, is_test)
  where status = 'approved' and is_test = false;
