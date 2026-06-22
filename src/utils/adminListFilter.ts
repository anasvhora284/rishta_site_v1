import type { AdminTab } from '@/components/admin/adminTypes'
import { isHiddenFromBrowseProfile } from '@/hooks/useProfiles'
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
    const hidden = isHiddenFromBrowseProfile(p)

    let tabMatch: boolean
    switch (tab) {
      case 'hidden':
        tabMatch = hidden
        break
      case 'all':
        tabMatch = !hidden
        break
      case 'approved':
        tabMatch = p.status === 'approved' && !hidden
        break
      default:
        tabMatch = p.status === tab && !hidden
        break
    }

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
