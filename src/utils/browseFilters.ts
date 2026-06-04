import { isPublicBrowseProfile } from '@/hooks/useProfiles'
import { QUALIFICATIONS, type Profile } from '@/types/profile'
import { calculateAge, displayCity, normalizeCity } from '@/utils'
import { normalizeQualificationBucket } from '@/utils/qualificationNormalize'

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

    const profileCity = normalizeCity(displayCity(data))
    const profileQual = normalizeQualificationBucket(
      data.education_category ?? data.qualification ?? '',
    )

    return (
      (!qualification.length || qualification.includes(profileQual)) &&
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
    .map((p) => normalizeCity(displayCity(p)))
    .filter(Boolean)
  return [...new Set(cities)].sort()
}

export function buildQualificationOptions(_profiles?: Profile[]): string[] {
  return [...QUALIFICATIONS]
}

export function buildMaritalStatusOptions(profiles: Profile[]): string[] {
  const statuses = profiles.map((p) => p.marital_status).filter(Boolean)
  return [...new Set(statuses)].sort()
}
