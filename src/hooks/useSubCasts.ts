import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LocalizedLabel } from '@/utils/localizeReference'

export interface SubCastRecord extends LocalizedLabel {}

let cachedSubCasts: SubCastRecord[] | null = null
let fetchPromise: Promise<SubCastRecord[]> | null = null

async function fetchSubCasts(): Promise<SubCastRecord[]> {
  const { data, error } = await supabase
    .from('sub_casts')
    .select('name, name_en, name_gu, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    code: row.name as string,
    name_en: (row.name_en as string) || (row.name as string),
    name_gu: (row.name_gu as string) || (row.name as string),
  }))
}

export function useSubCasts() {
  const [subCasts, setSubCasts] = useState<SubCastRecord[]>(cachedSubCasts ?? [])
  const [loading, setLoading] = useState(cachedSubCasts === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedSubCasts) return

    if (!fetchPromise) {
      fetchPromise = fetchSubCasts()
        .then((rows) => {
          cachedSubCasts = rows
          return rows
        })
        .finally(() => {
          fetchPromise = null
        })
    }

    void fetchPromise
      .then((rows) => {
        setSubCasts(rows)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load sub-casts')
        setLoading(false)
      })
  }, [])

  return { subCasts, loading, error }
}

export function subCastOptions(current: string, subCasts: SubCastRecord[]): SubCastRecord[] {
  const trimmed = current.trim()
  if (trimmed && !subCasts.some((s) => s.code === trimmed)) {
    return [{ code: trimmed, name_en: trimmed, name_gu: trimmed }, ...subCasts]
  }
  return subCasts
}
