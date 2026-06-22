import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LocalizedLabel } from '@/utils/localizeReference'

export interface CityRecord extends LocalizedLabel {}

let cachedCities: CityRecord[] | null = null
let fetchPromise: Promise<CityRecord[]> | null = null

/** Call after reference-data DB updates so clients pick up new labels. */
export function invalidateCitiesCache() {
  cachedCities = null
  fetchPromise = null
}

async function fetchCities(): Promise<CityRecord[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('name, name_en, name_gu, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    code: row.name as string,
    name_en: (row.name_en as string) || (row.name as string),
    name_gu: (row.name_gu as string) || (row.name_en as string) || (row.name as string),
  }))
}

export function useCities() {
  const [cities, setCities] = useState<CityRecord[]>(cachedCities ?? [])
  const [loading, setLoading] = useState(cachedCities === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedCities) return

    if (!fetchPromise) {
      fetchPromise = fetchCities()
        .then((rows) => {
          cachedCities = rows
          return rows
        })
        .finally(() => {
          fetchPromise = null
        })
    }

    void fetchPromise
      .then((rows) => {
        setCities(rows)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load cities')
        setLoading(false)
      })
  }, [])

  return { cities, loading, error }
}

/** Include legacy DB values when editing an older profile. */
export function cityOptions(current: string, cities: CityRecord[]): CityRecord[] {
  const trimmed = current.trim()
  if (trimmed && !cities.some((c) => c.code === trimmed)) {
    return [{ code: trimmed, name_en: trimmed, name_gu: trimmed }, ...cities]
  }
  return cities
}
