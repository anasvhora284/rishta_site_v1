export interface TeamMember {
  name: string
  phone: string
}

export function parseTeamMemberName(name: string): { display: string; location?: string } {
  const match = name.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (match) {
    return { display: match[1].trim(), location: match[2].trim() }
  }
  return { display: name }
}

export function normalizeIndianPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  return digits.slice(-10)
}

export function phoneTelHref(phone: string): string | null {
  const normalized = normalizeIndianPhone(phone)
  return normalized ? `tel:+91${normalized}` : null
}

export function phoneWhatsAppHref(phone: string): string | null {
  const normalized = normalizeIndianPhone(phone)
  return normalized ? `https://wa.me/91${normalized}` : null
}
