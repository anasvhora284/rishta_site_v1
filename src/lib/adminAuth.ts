import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function roleFromMetadata(meta: unknown): string | undefined {
  if (!meta || typeof meta !== 'object') return undefined
  const record = meta as Record<string, unknown>
  if (typeof record.role === 'string') return record.role
  if (Array.isArray(record.roles) && record.roles.includes('admin')) return 'admin'
  return undefined
}

/** True if this user/session has admin role (app_metadata, user_metadata, or JWT). */
export function isAdminUser(
  user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null,
  accessToken?: string | null,
): boolean {
  if (!user && !accessToken) return false

  if (user) {
    if (roleFromMetadata(user.app_metadata) === 'admin') return true
    if (roleFromMetadata(user.user_metadata) === 'admin') return true
  }

  if (accessToken) {
    const payload = decodeJwtPayload(accessToken)
    if (roleFromMetadata(payload?.app_metadata) === 'admin') return true
    if (roleFromMetadata(payload?.user_metadata) === 'admin') return true
  }

  return false
}

export function isAdminSession(session: Session | null): boolean {
  if (!session?.user) return false
  return isAdminUser(session.user, session.access_token)
}

export type AdminSignInResult =
  | { ok: true; session: Session; user: User }
  | { ok: false; code: 'auth' | 'not_admin'; message: string }

export async function signInAsAdmin(email: string, password: string): Promise<AdminSignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return {
      ok: false,
      code: 'auth',
      message: error?.message ?? 'Sign in failed',
    }
  }

  await supabase.auth.refreshSession()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const session = (await supabase.auth.getSession()).data.session ?? data.session
  const user = userData.user ?? data.user

  if (userError || !user) {
    await supabase.auth.signOut()
    return { ok: false, code: 'auth', message: userError?.message ?? 'Could not load user' }
  }

  if (!isAdminUser(user, session.access_token)) {
    await supabase.auth.signOut()
    return {
      ok: false,
      code: 'not_admin',
      message: 'This account is not an admin. Set App Metadata to { "role": "admin" } in Supabase.',
    }
  }

  return { ok: true, session, user }
}
