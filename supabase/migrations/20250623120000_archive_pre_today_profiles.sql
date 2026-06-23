-- Keep only today's submissions in live profiles; archive everything older.

create table if not exists profiles_backup_pre_today_20250623 as table profiles;

do $$
declare
  candidate_count int;
  inserted_count int;
  live_count int;
begin
  select count(*) into candidate_count
  from profiles
  where created_at::date < current_date;

  if candidate_count = 0 then
    raise notice 'No pre-today profiles to archive.';
    return;
  end if;

  insert into profiles_archive (
    id,
    profile_id,
    name,
    gender,
    qualification,
    qualification_other,
    current_profile,
    father_name,
    father_occupation,
    mother_name,
    city,
    city_other,
    date_of_birth,
    marital_status,
    height,
    weight_other,
    parent_contact,
    sub_cast,
    expectations,
    education_category,
    status,
    is_test,
    admin_notes,
    created_at,
    approved_at,
    approved_by,
    archived_at,
    archive_reason,
    original_id
  )
  select
    p.id,
    p.profile_id,
    p.name,
    p.gender,
    p.qualification,
    p.qualification_other,
    p.current_profile,
    p.father_name,
    p.father_occupation,
    p.mother_name,
    p.city,
    p.city_other,
    p.date_of_birth,
    p.marital_status,
    p.height,
    p.weight_other,
    p.parent_contact,
    p.sub_cast,
    p.expectations,
    p.education_category,
    p.status,
    p.is_test,
    p.admin_notes,
    p.created_at,
    p.approved_at,
    p.approved_by,
    now(),
    'pre_today_cleanup',
    p.id
  from profiles p
  where p.created_at::date < current_date
    and not exists (
      select 1 from profiles_archive a where a.original_id = p.id
    );

  get diagnostics inserted_count = row_count;

  if inserted_count <> candidate_count then
    raise exception 'Pre-today archive mismatch: expected %, inserted %', candidate_count, inserted_count;
  end if;

  delete from profiles
  where created_at::date < current_date;

  select count(*) into live_count from profiles;

  if exists (
    select 1 from profiles where created_at::date < current_date
  ) then
    raise exception 'Live table still has pre-today profiles after cleanup';
  end if;

  raise notice 'Archived % pre-today profiles. % today submissions remain live.', inserted_count, live_count;
end $$;
