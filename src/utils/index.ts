import { extractIndianMobile10 } from '@/utils/phoneValidation'
import { isOtherCity } from '@/data/canonical-cities'

export function calculateAge(dateString: string): number {
  const formattedDate = convertToDateObject(dateString)
  const currentDate = new Date()

  let age = currentDate.getFullYear() - formattedDate.getFullYear()

  if (
    currentDate.getMonth() < formattedDate.getMonth() ||
    (currentDate.getMonth() === formattedDate.getMonth() &&
      currentDate.getDate() < formattedDate.getDate())
  ) {
    age--
  }

  return age
}

export function convertToDateObject(unformattedDate: string): Date {
  if (unformattedDate.includes('T')) {
    const slicedDate = unformattedDate.slice(0, unformattedDate.indexOf('T'))
    return new Date(slicedDate)
  }

  const standardizedDateStr = unformattedDate.replace(/\//g, '-')
  const parts = standardizedDateStr.split('-').map((p) => p.trim())

  if (parts.length !== 3) {
    return new Date(unformattedDate)
  }

  // ISO from Supabase / HTML date input: YYYY-MM-DD
  if (parts[0].length === 4) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    return new Date(year, month, day)
  }

  // Legacy Excel / form format: DD-MM-YYYY
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)
  return new Date(year, month, day)
}

export function formatDisplayDate(dateString: string): string {
  const dateObj = convertToDateObject(dateString)
  return `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}, ${dateObj.getFullYear()}`
}

export function displayCity(
  profile: { city: string; city_other?: string | null },
  options?: { cityMap?: Map<string, { name_en: string; name_gu: string }>; lng?: string },
): string {
  if (isOtherCity(profile.city)) {
    return profile.city_other?.trim() || profile.city
  }
  if (options?.cityMap && options?.lng) {
    const record = options.cityMap.get(profile.city)
    if (record) {
      return options.lng.startsWith('en') ? record.name_en : record.name_gu || record.name_en
    }
  }
  return profile.city
}

export function normalizeCity(city: string): string {
  return city.trim().toLowerCase()
}

export function capitalizeWords(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function normalizePhoneDigits(phone: string): string {
  const digits = extractIndianMobile10(phone)
  if (digits.length === 10) return `91${digits}`
  const raw = phone.replace(/\D/g, '')
  return raw.startsWith('91') ? raw : `91${raw}`
}

export function toWhatsAppUrl(phone: string): string {
  return `https://wa.me/${normalizePhoneDigits(phone)}`
}

export function toTelUrl(phone: string): string {
  return `tel:+${normalizePhoneDigits(phone)}`
}
