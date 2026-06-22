import type { ProfileStatus } from '@/types/profile'

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
