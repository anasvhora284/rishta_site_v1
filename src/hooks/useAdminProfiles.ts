import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefetchOptions } from '@/hooks/useProfiles'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/profile'

export function useAdminProfiles(enabled = true) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchGeneration = useRef(0)

  const fetchProfiles = useCallback(async (opts?: RefetchOptions) => {
    const generation = ++fetchGeneration.current
    if (!opts?.silent) setLoading(true)
    setError(null)
    await supabase.auth.getSession()

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (generation !== fetchGeneration.current) return

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProfiles((data as Profile[]) ?? [])
    }
    if (!opts?.silent) setLoading(false)
  }, [])

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
