import type { AdminTab } from '@/components/admin/adminTypes'
import { matchesAdminSearch } from '@/utils/adminSearch'
import { assessDuplicate, type DuplicateAssessment } from '@/utils/profileDuplicate'
import type { Profile } from '@/types/profile'

export function filterAdminProfiles(
  profiles: Profile[],
  tab: AdminTab,
  search: string,
): Profile[] {
  const q = search.trim()
  return profiles.filter((p) => {
    const tabMatch = tab === 'all' ? true : p.status === tab
    if (!tabMatch) return false
    if (q && !matchesAdminSearch(p, q)) return false
    return true
  })
}

export function buildDuplicateById(profiles: Profile[]): Map<string, DuplicateAssessment> {
  const map = new Map<string, DuplicateAssessment>()
  for (const p of profiles) {
    if (p.status === 'pending') {
      map.set(p.id, assessDuplicate(p, profiles))
    }
  }
  return map
}
