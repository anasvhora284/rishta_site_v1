import { useCallback, useState } from 'react'
import { formDataToProfileUpdate, profileToFormData } from '@/components/profile-form/profileFormUtils'
import {
  approveProfile,
  hideProfileFromBrowse,
  mergePendingIntoExisting,
  rejectProfile,
  showProfileOnBrowse,
} from '@/hooks/useProfiles'
import type { Profile } from '@/types/profile'

interface UseAdminProfileActionsOptions {
  userId: string | null
  onRefetch: () => void
  removeProfileLocally: (id: string) => void
  patchProfileLocally: (id: string, updates: Partial<Profile>) => void
}

export function useAdminProfileActions({
  userId,
  onRefetch,
  removeProfileLocally,
  patchProfileLocally,
}: UseAdminProfileActionsOptions) {
  const [actionError, setActionError] = useState('')

  const approve = useCallback(
    async (profile: Profile) => {
      if (!userId) return false
      setActionError('')
      const { error } = await approveProfile(profile.id, userId)
      if (error) {
        setActionError(error.message)
        return false
      }
      removeProfileLocally(profile.id)
      onRefetch()
      return true
    },
    [userId, removeProfileLocally, onRefetch],
  )

  const reject = useCallback(
    async (profile: Profile, notes: string) => {
      if (!userId) return false
      setActionError('')
      const { error } = await rejectProfile(profile.id, notes, userId)
      if (error) {
        setActionError(error.message)
        return false
      }
      removeProfileLocally(profile.id)
      onRefetch()
      return true
    },
    [userId, removeProfileLocally, onRefetch],
  )

  const merge = useCallback(
    async (pending: Profile, existing: Profile) => {
      if (!userId) return false
      setActionError('')
      const updates = formDataToProfileUpdate(profileToFormData(pending), { preserveCityOther: true })
      const { error } = await mergePendingIntoExisting({
        pendingId: pending.id,
        existingId: existing.id,
        updates,
        userId,
        existingProfileId: existing.profile_id,
      })
      if (error) {
        setActionError(error.message)
        return false
      }
      removeProfileLocally(pending.id)
      patchProfileLocally(existing.id, updates)
      onRefetch()
      return true
    },
    [userId, removeProfileLocally, patchProfileLocally, onRefetch],
  )

  const hide = useCallback(
    async (profile: Profile) => {
      if (!userId) return false
      setActionError('')
      const { error } = await hideProfileFromBrowse(profile.id, userId)
      if (error) {
        setActionError(error.message)
        return false
      }
      patchProfileLocally(profile.id, { is_test: true, admin_notes: null })
      onRefetch()
      return true
    },
    [userId, patchProfileLocally, onRefetch],
  )

  const show = useCallback(
    async (profile: Profile) => {
      setActionError('')
      const { error } = await showProfileOnBrowse(profile.id)
      if (error) {
        setActionError(error.message)
        return false
      }
      patchProfileLocally(profile.id, { is_test: false, status: 'approved', admin_notes: null })
      onRefetch()
      return true
    },
    [patchProfileLocally, onRefetch],
  )

  return { actionError, setActionError, approve, reject, merge, hide, show }
}
