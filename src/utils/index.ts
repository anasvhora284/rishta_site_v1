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

export function displayCity(profile: { city: string; city_other?: string | null }): string {
  if (profile.city === 'Other') {
    return profile.city_other?.trim() || profile.city
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
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('91') ? digits : `91${digits}`
}

export function toWhatsAppUrl(phone: string): string {
  return `https://wa.me/${normalizePhoneDigits(phone)}`
}

export function toTelUrl(phone: string): string {
  return `tel:+${normalizePhoneDigits(phone)}`
}
