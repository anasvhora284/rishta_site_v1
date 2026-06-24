-- When a family submits the public form again while an earlier submission is still
-- pending, remove the older pending row(s) and keep only the latest insert.
-- Matching mirrors client duplicate rules: exact, name+DOB, or name+phone.

create or replace function profile_match_name_norm(t text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(coalesce(t, '')), '\s+', ' ', 'g'));
$$;

create or replace function profile_match_phone_norm(t text)
returns text
language sql
immutable
as $$
  select case
    when length(d) >= 10 then right(d, 10)
    else ''
  end
  from (select regexp_replace(coalesce(t, ''), '[^0-9]', '', 'g') as d) s;
$$;

create or replace function profile_match_city_norm(city text, city_other text)
returns text
language sql
immutable
as $$
  select lower(trim(
    case
      when upper(trim(coalesce(city, ''))) = 'OTHER' then coalesce(city_other, '')
      else coalesce(city, '')
    end
  ));
$$;

create or replace function replace_prior_pending_submissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_name text;
  new_dob date;
  new_phone text;
  new_father text;
  new_city text;
begin
  if new.status is distinct from 'pending' then
    return new;
  end if;

  if coalesce(auth.role(), '') <> 'anon' then
    return new;
  end if;

  new_name := profile_match_name_norm(new.name);
  new_dob := new.date_of_birth;
  new_phone := profile_match_phone_norm(new.parent_contact);
  new_father := profile_match_name_norm(new.father_name);
  new_city := profile_match_city_norm(new.city, new.city_other);

  delete from profiles as p
  where p.status = 'pending'
    and (
      (
        profile_match_name_norm(p.name) = new_name
        and p.date_of_birth = new_dob
        and profile_match_phone_norm(p.parent_contact) = new_phone
        and profile_match_phone_norm(p.parent_contact) <> ''
        and profile_match_name_norm(p.father_name) = new_father
        and profile_match_city_norm(p.city, p.city_other) = new_city
      )
      or (
        profile_match_name_norm(p.name) = new_name
        and p.date_of_birth = new_dob
      )
      or (
        profile_match_name_norm(p.name) = new_name
        and new_phone <> ''
        and profile_match_phone_norm(p.parent_contact) = new_phone
      )
    );

  return new;
end;
$$;

drop trigger if exists profiles_replace_prior_pending on profiles;

create trigger profiles_replace_prior_pending
  before insert on profiles
  for each row
  execute function replace_prior_pending_submissions();
