-- Move Excel-era profiles into profiles_archive (transactional)

do $$
declare
  candidate_count int;
  inserted_count int;
  live_count int;
begin
  select count(*) into candidate_count
  from profiles
  where approved_by is null
    and not (status = 'pending' and created_at::date >= current_date);

  if candidate_count = 0 then
    raise exception 'No archive candidates found — aborting';
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
    now(),
    'excel_import',
    id
  from profiles
  where approved_by is null
    and not (status = 'pending' and created_at::date >= current_date);

  get diagnostics inserted_count = row_count;

  if inserted_count <> candidate_count then
    raise exception 'Archive insert mismatch: expected %, inserted %', candidate_count, inserted_count;
  end if;

  delete from profiles
  where id in (select original_id from profiles_archive);

  select count(*) into live_count from profiles;

  if exists (
    select 1 from profiles
    where status = 'approved' and approved_by is null
  ) then
    raise exception 'Live table still has Excel-import approved rows after archival';
  end if;

  raise notice 'Archived % profiles. % remain live.', inserted_count, live_count;
end $$;
