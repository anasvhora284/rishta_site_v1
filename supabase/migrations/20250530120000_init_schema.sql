-- Rishta Portal schema

create table if not exists profiles (
  id                uuid primary key default gen_random_uuid(),
  profile_id        int unique,
  name              text not null,
  gender            text not null check (gender in ('male', 'female')),
  qualification     text not null,
  qualification_other text,
  current_profile   text not null,
  father_name       text not null,
  father_occupation text not null,
  mother_name       text not null,
  city              text not null,
  city_other        text,
  date_of_birth     date not null,
  marital_status    text not null check (marital_status in ('unmarried', 'divorce', 'widowed')),
  height            text not null,
  weight_other      text not null,
  parent_contact    text not null,
  sub_cast          text not null,
  education_category text,
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes       text,
  created_at        timestamptz not null default now(),
  approved_at       timestamptz,
  approved_by       uuid references auth.users(id)
);

create table if not exists cities (
  name text primary key
);

create table if not exists qualifications (
  name text primary key
);

-- Force pending status on public insert
create or replace function force_pending_status()
returns trigger as $$
begin
  if auth.role() = 'anon' then
    new.status := 'pending';
    new.profile_id := null;
    new.approved_at := null;
    new.approved_by := null;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger profiles_force_pending
  before insert on profiles
  for each row execute function force_pending_status();

-- Admin check helper
create or replace function is_admin()
returns boolean as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$ language sql stable security definer;

-- RLS
alter table profiles enable row level security;
alter table cities enable row level security;
alter table qualifications enable row level security;

-- Public can read approved profiles
create policy "Public read approved profiles"
  on profiles for select
  using (status = 'approved');

-- Public can submit pending profiles
create policy "Public insert pending profiles"
  on profiles for insert
  with check (status = 'pending');

-- Admins full access
create policy "Administration select"
  on profiles for select
  to authenticated
  using (is_admin());

create policy "Admin insert"
  on profiles for insert
  to authenticated
  with check (is_admin());

create policy "Admin update"
  on profiles for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admin delete"
  on profiles for delete
  to authenticated
  using (is_admin());

-- Cities and qualifications readable by all
create policy "Public read cities"
  on cities for select using (true);

create policy "Public read qualifications"
  on qualifications for select using (true);

create policy "Admin manage cities"
  on cities for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin manage qualifications"
  on qualifications for all to authenticated using (is_admin()) with check (is_admin());

-- Seed cities from Google Form options
insert into cities (name) values
  ('AHMEDABAD'), ('AJARPURA'), ('ALARSA'), ('ANAND'), ('ASOJ'), ('Ajarpura'), ('Anklav'),
  ('BAHIYAL'), ('BHADARVA'), ('BHALEJ'), ('BHARUCH'), ('BORSAD'), ('Borsad'), ('CHANGA'),
  ('DAKOR'), ('DUBAI'), ('GANDHINAGAR'), ('Gana'), ('KANIJ'), ('KAPADWANJ'), ('KASOR'),
  ('KATHLAL'), ('KHAMBHAT'), ('KHANDHLI'), ('KHEDA'), ('KOSINDRA'), ('Kalsar (dakor)'),
  ('Khambhat'), ('MAHEMDAVAD'), ('MAHESANA'), ('MAHUDHA'), ('MALAVADA'), ('MANDVI'),
  ('MUMBAI'), ('Mahemdavad'), ('NADIAD'), ('NAPA'), ('NAVSARI'), ('Navli'), ('Not Provided'),
  ('OD'), ('PADRA'), ('PETLAD'), ('PIPLAG'), ('RAS'), ('SANJAN'), ('SEVALIYA'), ('SOJITRA'),
  ('SURAT'), ('SURELI'), ('Salun'), ('TARAPUR'), ('THASRA'), ('UMETHA'), ('UMRETH'), ('USA'),
  ('UTTARSANDA'), ('VADODARA'), ('VALASAN'), ('VANSOL'), ('VASAD'), ('VASNA'), ('VASO'),
  ('VIRSAD'), ('Virar (Mumbai)- Maharashtra'), ('Wakaner'), ('Other')
on conflict do nothing;

insert into qualifications (name) values
  ('10th'), ('12th'), ('Bachelor'), ('Diploma'), ('Engineering'), ('Master'), ('Medical'), ('Other')
on conflict do nothing;

-- Index for common queries
create index if not exists profiles_status_idx on profiles (status);
create index if not exists profiles_profile_id_idx on profiles (profile_id);
