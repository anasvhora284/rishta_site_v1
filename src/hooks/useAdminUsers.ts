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
