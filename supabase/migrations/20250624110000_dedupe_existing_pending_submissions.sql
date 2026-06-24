-- One-time cleanup: pending duplicates that existed before replace_prior_pending_submissions.
-- Keeps the newest row per name+DOB or name+phone match; removes older pending copies.

delete from profiles as p
where p.status = 'pending'
  and exists (
    select 1
    from profiles as p2
    where p2.status = 'pending'
      and p2.id <> p.id
      and p2.created_at > p.created_at
      and (
        (
          profile_match_name_norm(p2.name) = profile_match_name_norm(p.name)
          and p2.date_of_birth = p.date_of_birth
        )
        or (
          profile_match_name_norm(p2.name) = profile_match_name_norm(p.name)
          and profile_match_phone_norm(p2.parent_contact) = profile_match_phone_norm(p.parent_contact)
          and profile_match_phone_norm(p.parent_contact) <> ''
        )
      )
  );
