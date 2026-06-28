import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type AdminRole = 'admin' | 'superuser'

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

function roleFromMetadata(meta: unknown): AdminRole | undefined {
  if (!meta || typeof meta !== 'object') return undefined
  const record = meta as Record<string, unknown>
  if (record.role === 'superuser') return 'superuser'
  if (record.role === 'admin') return 'admin'
  if (Array.isArray(record.roles) && record.roles.includes('superuser')) return 'superuser'
  if (Array.isArray(record.roles) && record.roles.includes('admin')) return 'admin'
  return undefined
}

export function getAdminRole(
  user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null,
  accessToken?: string | null,
): AdminRole | undefined {
  if (user) {
    const appRole = roleFromMetadata(user.app_metadata)
    if (appRole) return appRole
    const userRole = roleFromMetadata(user.user_metadata)
    if (userRole) return userRole
  }

  if (accessToken) {
    const payload = decodeJwtPayload(accessToken)
    const appRole = roleFromMetadata(payload?.app_metadata)
    if (appRole) return appRole
    const userRole = roleFromMetadata(payload?.user_metadata)
    if (userRole) return userRole
  }

  return undefined
}

/** True if this user/session has admin or superuser role. */
export function isAdminUser(
  user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null,
  accessToken?: string | null,
): boolean {
  const role = getAdminRole(user, accessToken)
  return role === 'admin' || role === 'superuser'
}

export function isSuperUser(
  user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null,
  accessToken?: string | null,
): boolean {
  return getAdminRole(user, accessToken) === 'superuser'
}

export function isAdminSession(session: Session | null): boolean {
  if (!session?.user) return false
  return isAdminUser(session.user, session.access_token)
}

export function isSuperUserSession(session: Session | null): boolean {
  if (!session?.user) return false
  return isSuperUser(session.user, session.access_token)
}

/** Gate password required before normal admins can reset their own password. */
export function verifyAdminPasswordResetGate(gatePassword: string): boolean {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD_RESET_GATE?.trim()
  if (!expected) return false
  return gatePassword === expected
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
      message: 'This account is not an admin.',
    }
  }

  return { ok: true, session, user }
}

export async function updateOwnAdminPassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword })
}
