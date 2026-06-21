import type { Profile } from '@/types/profile'
import { displayCity } from '@/utils'

function searchableText(profile: Profile): string {
  const parts = [
    profile.profile_id != null ? String(profile.profile_id) : '',
    profile.name,
    profile.gender,
    profile.date_of_birth,
    profile.qualification,
    profile.qualification_other ?? '',
    profile.education_category ?? '',
    profile.current_profile,
    profile.father_name,
    profile.father_occupation,
    profile.mother_name,
    profile.city,
    profile.city_other ?? '',
    displayCity(profile),
    profile.marital_status,
    profile.height,
    profile.weight_other,
    profile.parent_contact,
    profile.sub_cast,
    profile.status,
    profile.admin_notes ?? '',
    profile.created_at,
    profile.approved_at ?? '',
  ]
  return parts.join(' ').toLowerCase()
}

export function matchesAdminSearch(profile: Profile, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = searchableText(profile)
  const tokens = q.split(/\s+/).filter(Boolean)
  return tokens.every((token) => haystack.includes(token))
}
