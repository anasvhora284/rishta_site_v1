/** Indian mobile (WhatsApp) number helpers — store/display 10 digits only. */

const MOBILE_RE = /^[6-9]\d{9}$/

/** Strip formatting; return last 10 digits when +91 / leading 0 is present. */
export function extractIndianMobile10(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  if (digits.length > 10) return digits.slice(-10)
  return digits
}

export function isValidIndianMobile(raw: string): boolean {
  return MOBILE_RE.test(extractIndianMobile10(raw))
}

/** Keep digits only, max 10 — for controlled text input. */
export function formatIndianMobileInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}
