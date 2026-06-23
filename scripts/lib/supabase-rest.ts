/**
 * Minimal Supabase REST client for scripts (Node 18 compatible — no WebSocket).
 */

export function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
  }
  return { url, key }
}

export async function restFetch<T>(
  path: string,
  options: { method?: string; headers?: Record<string, string>; body?: unknown } = {},
): Promise<T> {
  const { url, key } = getSupabaseConfig()
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers,
    },
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`REST ${path} failed (${res.status}): ${text}`)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function fetchAllProfiles(): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = []
  const pageSize = 1000
  let from = 0

  while (true) {
    const { url, key } = getSupabaseConfig()
    const res = await fetch(
      `${url}/rest/v1/profiles?select=*&order=created_at.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Range: `${from}-${from + pageSize - 1}`,
        },
      },
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`profiles fetch failed (${res.status}): ${text}`)
    }

    const data = (await res.json()) as Record<string, unknown>[]
    rows.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }

  return rows
}

export async function fetchAuthUsers(): Promise<Record<string, unknown>[]> {
  const { url, key } = getSupabaseConfig()
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`auth users fetch failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { users: Record<string, unknown>[] }
  return data.users
}

export async function countTable(
  table: 'profiles' | 'profiles_archive',
  filter?: string,
): Promise<number> {
  const { url, key } = getSupabaseConfig()
  const query = filter ? `?select=id&${filter}` : '?select=id'
  const res = await fetch(`${url}/rest/v1/${table}${query}`, {
    method: 'HEAD',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'count=exact',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`count ${table} failed (${res.status}): ${text}`)
  }

  const range = res.headers.get('content-range')
  if (!range) return 0
  const total = range.split('/')[1]
  return total === '*' ? 0 : Number(total)
}
