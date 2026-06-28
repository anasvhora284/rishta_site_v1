-- Superuser role, safe profile_id allocation, and admin user management RPCs

create or replace function is_admin()
returns boolean as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'superuser'),
    (auth.jwt() -> 'user_metadata' ->> 'role') in ('admin', 'superuser'),
    false
  );
$$ language sql stable security definer set search_path = public;

create or replace function is_superuser()
returns boolean as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'superuser',
    false
  );
$$ language sql stable security definer set search_path = public;

create or replace function approve_profile_and_assign_id(p_profile_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_next integer;
begin
  if not is_admin() then
    raise exception 'forbidden';
  end if;

  perform pg_advisory_xact_lock(68068);

  select coalesce(max(profile_id), 0) + 1
  into v_next
  from profiles
  where profile_id is not null;

  update profiles
  set
    status = 'approved',
    profile_id = v_next,
    approved_at = now(),
    approved_by = auth.uid()
  where id = p_profile_id;

  if not found then
    raise exception 'Profile not found';
  end if;

  return v_next;
end;
$$;

grant execute on function approve_profile_and_assign_id(uuid) to authenticated;

create or replace function list_admin_users()
returns table (
  id uuid,
  email text,
  name text,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  if not is_superuser() then
    raise exception 'forbidden';
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(u.raw_user_meta_data ->> 'name', ''),
    coalesce(u.raw_app_meta_data ->> 'role', ''),
    u.created_at
  from auth.users u
  where coalesce(u.raw_app_meta_data ->> 'role', '') in ('admin', 'superuser')
  order by u.created_at;
end;
$$;

grant execute on function list_admin_users() to authenticated;

create or replace function superuser_create_admin(
  p_email text,
  p_password text,
  p_name text
)
returns uuid
language plpgsql
security definer
set search_path = auth, public, extensions
as $$
declare
  v_user_id uuid := gen_random_uuid();
  v_now timestamptz := now();
  v_email text := lower(trim(p_email));
begin
  if not is_superuser() then
    raise exception 'forbidden';
  end if;

  if v_email = '' or length(p_password) < 8 then
    raise exception 'invalid email or password';
  end if;

  if exists (select 1 from auth.users where email = v_email) then
    raise exception 'email already exists';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf')),
    v_now,
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', 'admin'),
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'name', p_name, 'email_verified', true, 'phone_verified', false),
    v_now, v_now,
    '', '', '', '',
    false, false
  );

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, created_at, updated_at, last_sign_in_at
  ) values (
    v_user_id, v_user_id, v_user_id::text, 'email',
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
    v_now, v_now, v_now
  );

  return v_user_id;
end;
$$;

grant execute on function superuser_create_admin(text, text, text) to authenticated;

create or replace function superuser_update_admin(
  p_user_id uuid,
  p_email text,
  p_name text,
  p_password text default null
)
returns void
language plpgsql
security definer
set search_path = auth, public, extensions
as $$
declare
  v_email text := lower(trim(p_email));
  v_role text;
begin
  if not is_superuser() then
    raise exception 'forbidden';
  end if;

  select raw_app_meta_data ->> 'role' into v_role
  from auth.users
  where id = p_user_id;

  if v_role is null or v_role not in ('admin', 'superuser') then
    raise exception 'user not found';
  end if;

  if exists (
    select 1 from auth.users
    where email = v_email and id <> p_user_id
  ) then
    raise exception 'email already exists';
  end if;

  update auth.users
  set
    email = v_email,
    encrypted_password = case
      when p_password is not null and length(p_password) >= 8 then crypt(p_password, gen_salt('bf'))
      else encrypted_password
    end,
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('name', p_name, 'email', v_email),
    updated_at = now()
  where id = p_user_id;

  update auth.identities
  set
    identity_data = jsonb_set(
      identity_data,
      '{email}',
      to_jsonb(v_email)
    ),
    updated_at = now()
  where user_id = p_user_id and provider = 'email';
end;
$$;

grant execute on function superuser_update_admin(uuid, text, text, text) to authenticated;

create or replace function superuser_delete_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = auth, public
as $$
declare
  v_role text;
  v_superuser_count integer;
begin
  if not is_superuser() then
    raise exception 'forbidden';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'cannot delete your own account';
  end if;

  select raw_app_meta_data ->> 'role' into v_role
  from auth.users
  where id = p_user_id;

  if v_role is null or v_role not in ('admin', 'superuser') then
    raise exception 'user not found';
  end if;

  if v_role = 'superuser' then
    select count(*) into v_superuser_count
    from auth.users
    where raw_app_meta_data ->> 'role' = 'superuser';

    if v_superuser_count <= 1 then
      raise exception 'cannot delete the only superuser';
    end if;
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;

grant execute on function superuser_delete_admin(uuid) to authenticated;
