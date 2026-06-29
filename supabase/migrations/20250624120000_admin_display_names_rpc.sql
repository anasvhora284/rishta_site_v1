-- Resolve admin user ids to display names for profile list/detail (all admins).

create or replace function list_admin_display_names()
returns table (
  id uuid,
  name text
)
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  if not is_admin() then
    raise exception 'forbidden';
  end if;

  return query
  select
    u.id,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      split_part(u.email::text, '@', 1)
    ) as name
  from auth.users u
  where coalesce(u.raw_app_meta_data ->> 'role', '') in ('admin', 'superuser');
end;
$$;

grant execute on function list_admin_display_names() to authenticated;
