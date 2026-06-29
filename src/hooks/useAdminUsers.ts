import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface AdminUserRow {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

export async function listAdminUsers() {
  return supabase.rpc('list_admin_users')
}

export async function createAdminUser(email: string, password: string, name: string) {
  return supabase.rpc('superuser_create_admin', {
    p_email: email.trim(),
    p_password: password,
    p_name: name.trim(),
  })
}

export async function updateAdminUser(
  userId: string,
  email: string,
  name: string,
  password?: string,
) {
  return supabase.rpc('superuser_update_admin', {
    p_user_id: userId,
    p_email: email.trim(),
    p_name: name.trim(),
    p_password: password?.trim() ? password : null,
  })
}

export async function deleteAdminUser(userId: string) {
  return supabase.rpc('superuser_delete_admin', { p_user_id: userId })
}

let cachedAdminNameMap: Map<string, string> | null = null
let adminNameMapPromise: Promise<Map<string, string>> | null = null

async function fetchAdminNameMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase.rpc('list_admin_display_names')
  if (error) throw error
  return new Map(
    (data ?? []).map((row: { id: string; name: string }) => [row.id, row.name || 'Admin']),
  )
}

/** Shared id → display name map for approved_by / rejected-by labels. */
export function useAdminNameMap(enabled = true) {
  const [nameById, setNameById] = useState<Map<string, string>>(cachedAdminNameMap ?? new Map())
  const [loading, setLoading] = useState(enabled && cachedAdminNameMap === null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    if (cachedAdminNameMap) {
      setNameById(cachedAdminNameMap)
      setLoading(false)
      return
    }

    if (!adminNameMapPromise) {
      adminNameMapPromise = fetchAdminNameMap()
        .then((map) => {
          cachedAdminNameMap = map
          return map
        })
        .finally(() => {
          adminNameMapPromise = null
        })
    }

    void adminNameMapPromise
      .then((map) => {
        setNameById(map)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [enabled])

  return { nameById, loading }
}
