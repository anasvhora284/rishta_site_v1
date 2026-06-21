/** Normalization helpers aligned with scripts/excel-sync-utils.ts */

export function norm(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function normPhone(s: unknown): string {
  const d = norm(s).replace(/[^\d]/g, '')
  return d.length >= 10 ? d.slice(-10) : d
}

export function normDob(dob: string): string {
  const d = dob.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  const parts = d.replace(/\//g, '-').split('-')
  if (parts.length === 3 && parts[0].length <= 2) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }
  return d
}

export interface ProfileMatchKeys {
  nameNorm: string
  dobNorm: string
  phoneNorm: string
  fatherNorm: string
  cityNorm: string
}

export function profileMatchKeys(profile: {
  name: string
  date_of_birth: string
  parent_contact: string
  father_name: string
  city: string
  city_other?: string | null
}): ProfileMatchKeys {
  const cityNorm = norm(profile.city === 'Other' ? profile.city_other : profile.city)
  return {
    nameNorm: norm(profile.name),
    dobNorm: normDob(profile.date_of_birth),
    phoneNorm: normPhone(profile.parent_contact),
    fatherNorm: norm(profile.father_name),
    cityNorm,
  }
}

export function exactMatchKey(keys: ProfileMatchKeys): string {
  return `${keys.nameNorm}|${keys.dobNorm}|${keys.phoneNorm}|${keys.fatherNorm}|${keys.cityNorm}`
}

export function nameDobKey(keys: ProfileMatchKeys): string {
  return `${keys.nameNorm}|${keys.dobNorm}`
}

export function namePhoneKey(keys: ProfileMatchKeys): string {
  return `${keys.nameNorm}|${keys.phoneNorm}`
}
