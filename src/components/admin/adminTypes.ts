import type { Profile, ProfileStatus } from '@/types/profile'
import type { TFunction } from 'i18next'

export type AdminTab = ProfileStatus | 'all' | 'hidden'

export interface AdminStats {
  pending: number
  approved: number
  rejected: number
  hidden: number
}

export function formatAdminDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/** Label for who approved/rejected a profile (uses approved_by for both). */
export function formatProfileActedBy(
  profile: Profile,
  nameById: Map<string, string>,
  t: TFunction,
): string | null {
  if (!profile.approved_by) return null

  const name = nameById.get(profile.approved_by) ?? t('admin.unknownAdmin')

  if (profile.status === 'approved') {
    return t('admin.approvedBy', { name })
  }

  if (profile.status === 'rejected') {
    return t('admin.rejectedBy', { name })
  }

  return null
}
