import { useEffect, useState } from 'react'
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

export function useProfiles(
  status?: ProfileStatus,
  enabled = true,
  options?: UseProfilesOptions,
) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const publicBrowseOnly = options?.publicBrowseOnly ?? false

  const fetchProfiles = async () => {
    setLoading(true)
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
    if (fetchError) {
      setError(fetchError.message)
    } else {
      let rows = (data as Profile[]) ?? []
      if (publicBrowseOnly) {
        rows = rows.filter(isPublicBrowseProfile)
      }
      setProfiles(rows)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    void fetchProfiles()
  }, [status, enabled, publicBrowseOnly])

  return { profiles, loading, error, refetch: fetchProfiles }
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
  const { error } = await supabase.from('profiles').update(updates).eq('id', id)
  return { error }
}

export async function hideProfileFromBrowse(id: string, userId: string) {
  const { error } = await supabase.from('profiles').update({ is_test: true }).eq('id', id)
  if (!error) return { error: null }
  // Column may not exist until migration — reject removes from public approved list
  return rejectProfile(id, 'Hidden from browse', userId)
}
