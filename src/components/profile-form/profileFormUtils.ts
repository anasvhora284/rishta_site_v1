import type { Gender, MaritalStatus, Profile, ProfileFormData } from '@/types/profile'
import { calculateAge } from '@/utils'

type TranslateFn = (key: string) => string

/** Latest DOB allowed (must be at least 18 years old). */
export function maxDateOfBirthForMinAge(minAge = 18): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - minAge)
  return d.toISOString().slice(0, 10)
}

/** Normalize DB date to HTML date input value (YYYY-MM-DD). */
export function profileDateToInput(date: string): string {
  if (!date) return ''
  if (date.includes('T')) return date.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const parts = date.replace(/\//g, '-').split('-')
  if (parts.length === 3 && parts[0].length <= 2) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }
  return date
}

export function profileToFormData(profile: Profile): ProfileFormData {
  return {
    name: profile.name,
    gender: profile.gender,
    qualification: profile.qualification,
    qualification_other: profile.qualification_other ?? '',
    current_profile: profile.current_profile,
    father_name: profile.father_name,
    father_occupation: profile.father_occupation,
    mother_name: profile.mother_name,
    city: profile.city,
    city_other: profile.city_other ?? '',
    date_of_birth: profileDateToInput(profile.date_of_birth),
    marital_status: profile.marital_status,
    height: profile.height,
    weight_other: profile.weight_other,
    parent_contact: profile.parent_contact,
    sub_cast: profile.sub_cast,
  }
}

export function formDataToProfileUpdate(form: ProfileFormData) {
  const qualificationOther =
    form.qualification === 'Other' ? form.qualification_other.trim() || null : null

  return {
    name: form.name.trim(),
    gender: form.gender as Gender,
    qualification: form.qualification,
    qualification_other: qualificationOther,
    education_category:
      form.qualification === 'Other' ? form.qualification_other.trim() : form.qualification,
    current_profile: form.current_profile.trim(),
    father_name: form.father_name.trim(),
    father_occupation: form.father_occupation.trim(),
    mother_name: form.mother_name.trim(),
    city: form.city,
    city_other: form.city === 'Other' ? form.city_other.trim() || null : null,
    date_of_birth: form.date_of_birth,
    marital_status: form.marital_status as MaritalStatus,
    height: form.height.trim(),
    weight_other: form.weight_other.trim(),
    parent_contact: form.parent_contact.trim(),
    sub_cast: form.sub_cast.trim(),
  }
}

/** Build a Profile-shaped object for the submit-flow preview card. */
export function formDataToPreviewProfile(form: ProfileFormData): Profile {
  const update = formDataToProfileUpdate(form)
  return {
    id: 'preview',
    profile_id: null,
    ...update,
    status: 'pending',
    admin_notes: null,
    created_at: new Date().toISOString(),
    approved_at: null,
    approved_by: null,
  }
}

export function validateProfileForm(
  form: ProfileFormData,
  t: TranslateFn,
  options?: { step?: number },
): Partial<Record<keyof ProfileFormData, string>> {
  const e: Partial<Record<keyof ProfileFormData, string>> = {}
  const step = options?.step

  const check = (s: number) => step === undefined || step === s

  if (check(0)) {
    if (!form.name.trim()) e.name = t('submit.required')
    if (!form.gender) e.gender = t('submit.required')
    if (!form.date_of_birth) {
      e.date_of_birth = t('submit.invalidDate')
    } else if (calculateAge(form.date_of_birth) < 18) {
      e.date_of_birth = t('submit.minAge')
    }
  }
  if (check(1)) {
    if (!form.qualification) e.qualification = t('submit.required')
    if (form.qualification === 'Other' && !form.qualification_other.trim()) {
      e.qualification_other = t('submit.required')
    }
    if (!form.current_profile.trim()) e.current_profile = t('submit.required')
  }
  if (check(2)) {
    if (!form.father_name.trim()) e.father_name = t('submit.required')
    if (!form.father_occupation.trim()) e.father_occupation = t('submit.required')
    if (!form.mother_name.trim()) e.mother_name = t('submit.required')
  }
  if (check(3)) {
    if (!form.city) e.city = t('submit.required')
    if (form.city === 'Other' && !form.city_other.trim()) e.city_other = t('submit.required')
    if (!form.sub_cast.trim()) e.sub_cast = t('submit.required')
    if (!form.marital_status) e.marital_status = t('submit.required')
  }
  if (check(4)) {
    if (!form.height.trim()) e.height = t('submit.required')
    if (!form.weight_other.trim()) e.weight_other = t('submit.required')
    const phone = form.parent_contact.replace(/\D/g, '')
    if (phone.length < 10) e.parent_contact = t('submit.invalidPhone')
  }

  return e
}
