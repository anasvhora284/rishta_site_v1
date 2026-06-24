import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, ProfileStatus } from '@/types/profile'

/** Hide from public browse without requiring DB `is_test` column (works before migration). */
export function isPublicBrowseProfile(profile: Profile): boolean {
  if (profile.is_test) return false
  const name = profile.name.toLowerCase()
  if (name.includes('e2e') || /\btest\b/.test(name)) return false
  const notes = (profile.admin_notes ?? '').toLowerCase()
  if (notes.includes('e2e') || notes.includes('test')) return false
  return true
}

export interface UseProfilesOptions {
  /** Exclude test/E2E rows — use on public browse even if admin is logged in */
  publicBrowseOnly?: boolean
}

export interface RefetchOptions {
  /** Skip the full-list loading spinner (use after admin actions). */
  silent?: boolean
}

export function useProfiles(
  status?: ProfileStatus,
  enabled = true,
  options?: UseProfilesOptions,
) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const publicBrowseOnly = options?.publicBrowseOnly ?? false
  const fetchGeneration = useRef(0)

  const fetchProfiles = useCallback(
    async (opts?: RefetchOptions) => {
      const generation = ++fetchGeneration.current
      if (!opts?.silent) setLoading(true)
      setError(null)
      // Ensure auth session is attached before admin RLS queries
      await supabase.auth.getSession()

      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (status) {
        query = query.eq('status', status)
      } else {
        query = query.eq('status', 'approved')
      }
      const { data, error: fetchError } = await query
      if (generation !== fetchGeneration.current) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        let rows = (data as Profile[]) ?? []
        if (publicBrowseOnly) {
          rows = rows.filter(isPublicBrowseProfile)
        }
        setProfiles(rows)
      }
      if (!opts?.silent) setLoading(false)
    },
    [status, publicBrowseOnly],
  )

  const removeProfileLocally = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const patchProfileLocally = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    void fetchProfiles()
  }, [enabled, fetchProfiles])

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    removeProfileLocally,
    patchProfileLocally,
  }
}

export async function submitProfile(
  data: Omit<
    Profile,
    | 'id'
    | 'profile_id'
    | 'status'
    | 'admin_notes'
    | 'created_at'
    | 'approved_at'
    | 'approved_by'
    | 'education_category'
    | 'is_test'
  >,
) {
  // DB trigger replace_prior_pending_submissions removes older pending rows for the
  // same person (exact / name+DOB / name+phone) before this insert lands.
  const { error } = await supabase.from('profiles').insert({
    ...data,
    status: 'pending',
    education_category: data.qualification === 'Other' ? data.qualification_other : data.qualification,
  })
  return { error }
}

export async function approveProfile(id: string, userId: string) {
  const { data: maxRows } = await supabase
    .from('profiles')
    .select('profile_id')
    .eq('status', 'approved')
    .not('profile_id', 'is', null)
    .order('profile_id', { ascending: false })
    .limit(1)

  const nextId = ((maxRows?.[0]?.profile_id as number | undefined) ?? 0) + 1

  const { error } = await supabase
    .from('profiles')
    .update({
      status: 'approved',
      profile_id: nextId,
      approved_at: new Date().toISOString(),
      approved_by: userId,
    })
    .eq('id', id)

  return { error, profileId: nextId }
}

export async function rejectProfile(id: string, notes: string, userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({
      status: 'rejected',
      admin_notes: notes || null,
      approved_by: userId,
    })
    .eq('id', id)
  return { error }
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select('id').maybeSingle()
  if (error) return { error }
  if (!data) return { error: new Error('Profile update did not apply — check admin permissions.') }
  return { error: null }
}

export async function mergePendingIntoExisting({
  pendingId,
  existingId,
  updates,
  userId,
  existingProfileId,
}: {
  pendingId: string
  existingId: string
  updates: Partial<Profile>
  userId: string
  existingProfileId: number | null
}) {
  const { error: updateError } = await updateProfile(existingId, updates)
  if (updateError) return { error: updateError }

  const note = existingProfileId
    ? `Duplicate — updated existing profile ID ${existingProfileId}`
    : 'Duplicate — merged into existing profile'

  const { error: rejectError } = await rejectProfile(pendingId, note, userId)
  if (rejectError) {
    return {
      error: new Error(
        `Existing profile was updated, but rejecting the duplicate failed: ${rejectError.message}`,
      ),
    }
  }

  return { error: null }
}

/** Profile was hidden from public browse (flag or legacy reject note). */
export function isHiddenFromBrowseProfile(profile: Profile): boolean {
  if (profile.is_test) return true
  return (profile.admin_notes ?? '').toLowerCase().includes('hidden from browse')
}

export async function hideProfileFromBrowse(id: string, _userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_test: true, admin_notes: null })
    .eq('id', id)
  return { error }
}

/** Undo hide: back on public browse as approved. */
export async function showProfileOnBrowse(id: string) {
  const { data: row, error: fetchError } = await supabase
    .from('profiles')
    .select('admin_notes')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) return { error: fetchError }

  const notes = (row?.admin_notes as string | null) ?? ''
  const clearHiddenNote = notes.toLowerCase().includes('hidden from browse')

  const { error } = await supabase
    .from('profiles')
    .update({
      is_test: false,
      status: 'approved',
      ...(clearHiddenNote ? { admin_notes: null } : {}),
    })
    .eq('id', id)
  return { error }
}
