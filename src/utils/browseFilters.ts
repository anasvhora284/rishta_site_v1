import { isPublicBrowseProfile } from '@/hooks/useProfiles'
import type { Profile } from '@/types/profile'
import { calculateAge, normalizeCity } from '@/utils'

export interface BrowseFilterCriteria {
  fromAge: string
  toAge: string
  qualification: string[]
  city: string[]
  maritalStatus: string[]
  gender: string
}

export const emptyBrowseFilterCriteria = (): BrowseFilterCriteria => ({
  fromAge: '',
  toAge: '',
  qualification: [],
  city: [],
  maritalStatus: [],
  gender: '',
})

export function applyBrowseFilters(
  profiles: Profile[],
  criteria: BrowseFilterCriteria,
): Profile[] {
  const { fromAge, toAge, qualification, city, maritalStatus, gender } = criteria

  return profiles.filter((data) => {
    if (!isPublicBrowseProfile(data)) return false

    const dobStr = data.date_of_birth.replace(/-/g, '/')
    const userAge = calculateAge(dobStr)

    if ((fromAge && userAge < parseInt(fromAge, 10)) || (toAge && userAge > parseInt(toAge, 10))) {
      return false
    }

    const profileCity = normalizeCity(
      data.city === 'Other' ? (data.city_other ?? data.city) : data.city,
    )
    const eduCat = (data.education_category ?? data.qualification).trim()

    return (
      (!qualification.length || qualification.includes(eduCat)) &&
      (!gender || data.gender === gender) &&
      (!city.length || city.includes(profileCity)) &&
      (!maritalStatus.length || maritalStatus.includes(data.marital_status))
    )
  })
}

export function validateBrowseFilterAges(
  fromAge: string,
  toAge: string,
  t: (key: string) => string,
): { fromAgeError: string; toAgeError: string; valid: boolean } {
  let fromAgeError = ''
  let toAgeError = ''

  if (fromAge && Number(fromAge) <= 0) fromAgeError = t('filter.fromAgeError')
  if (fromAge && Number(fromAge) > 100) fromAgeError = t('filter.toAgeError')
  if (toAge && Number(toAge) <= 0) toAgeError = t('filter.fromAgeError')
  if (toAge && Number(toAge) > 100) toAgeError = t('filter.toAgeError')
  if (fromAge && toAge && Number(toAge) < Number(fromAge)) toAgeError = t('filter.ageRangeError')

  return { fromAgeError, toAgeError, valid: !fromAgeError && !toAgeError }
}

export function buildCityOptions(profiles: Profile[]): string[] {
  const cities = profiles
    .map((p) => normalizeCity(p.city === 'Other' ? (p.city_other ?? p.city) : p.city))
    .filter(Boolean)
  return [...new Set(cities)].sort()
}

export function buildQualificationOptions(profiles: Profile[]): string[] {
  const quals = profiles
    .map((p) => (p.education_category ?? p.qualification).trim())
    .filter(Boolean)
  const unique = [...new Set(quals)]
  const special = ['10th', '12th'].filter((q) => unique.includes(q))
  const rest = unique.filter((q) => !special.includes(q)).sort()
  return [...special, ...rest]
}

export function buildMaritalStatusOptions(profiles: Profile[]): string[] {
  const statuses = profiles.map((p) => p.marital_status).filter(Boolean)
  return [...new Set(statuses)].sort()
}
