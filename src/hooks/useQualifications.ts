import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LocalizedLabel } from '@/utils/localizeReference'

export interface QualificationRecord extends LocalizedLabel {}

let cachedQualifications: QualificationRecord[] | null = null
let fetchPromise: Promise<QualificationRecord[]> | null = null

/** Call after reference-data DB updates so clients pick up new labels. */
export function invalidateQualificationsCache() {
  cachedQualifications = null
  fetchPromise = null
}

async function fetchQualifications(): Promise<QualificationRecord[]> {
  const { data, error } = await supabase.from('qualifications').select('name, name_en, name_gu')

  if (error) throw error
  return (data ?? []).map((row) => ({
    code: row.name as string,
    name_en: (row.name_en as string) || (row.name as string),
    name_gu: (row.name_gu as string) || (row.name as string),
  }))
}

export function useQualifications() {
  const [qualifications, setQualifications] = useState<QualificationRecord[]>(
    cachedQualifications ?? [],
  )
  const [loading, setLoading] = useState(cachedQualifications === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedQualifications) return

    if (!fetchPromise) {
      fetchPromise = fetchQualifications()
        .then((rows) => {
          cachedQualifications = rows
          return rows
        })
        .finally(() => {
          fetchPromise = null
        })
    }

    void fetchPromise
      .then((rows) => {
        setQualifications(rows)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load qualifications')
        setLoading(false)
      })
  }, [])

  return { qualifications, loading, error }
}
