-- Pre-archive snapshots + profiles_archive table (not queried by the portal)

-- Snapshot live data before any destructive change
create table if not exists profiles_backup_20250623 as table profiles;

create table if not exists cities_backup_20250623 as table cities;

create table if not exists qualifications_backup_20250623 as table qualifications;

create table if not exists sub_casts_backup_20250623 as table sub_casts;

create table if not exists auth_users_backup_20250623 as
  select id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  from auth.users;

-- Archive table: mirror of profiles + archival metadata
create table if not exists profiles_archive (
  like profiles including defaults,
  archived_at timestamptz not null default now(),
  archive_reason text not null default 'excel_import',
  original_id uuid not null,
  primary key (original_id)
);

-- Drop inherited unique on profile_id from LIKE if present; re-add as non-PK unique
alter table profiles_archive drop constraint if exists profiles_archive_profile_id_key;
create unique index if not exists profiles_archive_profile_id_idx on profiles_archive (profile_id)
  where profile_id is not null;

alter table profiles_archive enable row level security;

-- No public/authenticated policies — service role and SQL editor only

comment on table profiles_archive is 'Excel-era profiles moved out of live profiles table. Not used by the portal app.';
