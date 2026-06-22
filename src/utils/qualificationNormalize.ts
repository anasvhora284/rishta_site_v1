import type { TFunction } from 'i18next'
import { QUALIFICATIONS, type Profile } from '@/types/profile'
import { localizedName, localizedQualification, type LocalizedLabel } from '@/utils/localizeReference'

export type QualificationBucket = (typeof QUALIFICATIONS)[number]

/** Localized qualification for profile cards (DB labels, then i18n, then legacy free-text). */
export function formatLocalizedQualificationDisplay(
  profile: Pick<Profile, 'qualification' | 'qualification_other' | 'education_category'>,
  lng: string,
  qualificationMap: Map<string, LocalizedLabel>,
  t: TFunction,
): string {
  const q = profile.qualification?.trim() ?? ''
  const other = profile.qualification_other?.trim()

  if (q === 'Other' && other) {
    const otherLabel = localizedName(
      qualificationMap.get('Other'),
      lng,
      localizedQualification('Other', t, 'Other'),
    )
    return `${otherLabel} (${other})`
  }

  const record = qualificationMap.get(q)
  if (record) {
    return localizedName(record, lng, localizedQualification(q, t, q))
  }

  const fallback = profile.education_category?.trim() || q
  return fallback || localizedQualification(q, t, q)
}

/** Show "Other (custom text)" when qualification is Other and a detail was entered. */
export function formatQualificationDisplay(
  profile: Pick<Profile, 'qualification' | 'qualification_other'>,
  options?: { uppercase?: boolean },
): string {
  const q = profile.qualification?.trim() ?? ''
  const other = profile.qualification_other?.trim()
  if (q === 'Other' && other) {
    const label = `Other (${other})`
    return options?.uppercase ? label.toUpperCase() : label
  }
  return options?.uppercase ? q.toUpperCase() : q
}

/** Map free-text / legacy DB qualification strings to one of 8 buckets. */
export function normalizeQualificationBucket(raw: string): QualificationBucket {
  const q = raw.trim().toLowerCase()
  if (!q) return 'Other'

  for (const bucket of QUALIFICATIONS) {
    if (q === bucket.toLowerCase()) return bucket
  }

  if (/mbbs|bhms|bds|nurs|gnm|pharm|doctor|medical|physio|dmlt|d\.?\s?pharm|mb\.?\s?bs/i.test(q)) {
    return 'Medical'
  }

  if (
    /\bb\.?\s?e\.?\b|b\.?\s?tech|be\b|engineering|engineer|\biti\b|mechanical|civil|electrical|computer engineer|software engineer|diploma.*eng|automobile|petrochemical|chemical eng|ec engineering|information technology|\bcse\b|\bcivil\b|\bme\b/i.test(
      q,
    )
  ) {
    return 'Engineering'
  }

  if (
    /\bb\.?\s?com\b|bcom|bachelor|graduate|graduation|\bba\b|\bbca\b|\bbba\b|commerce|llb|ll\.?\s?b|b\.?\s?sc\b(?!.*nurs)|ty\.?\s?b\.?\s?com|sy\.?\s?b\.?\s?com|fy\.?\s?b\.?\s?com/i.test(
      q,
    )
  ) {
    return 'Bachelor'
  }

  if (
    /\bm\.?\s?com\b|mcom|\bma\b|\bm\.?\s?sc\b|\bmba\b|\bm\.?\s?a\.?\b|master|post\s?grad|m\.?\s?phil|ph\.?\s?d|\bphd\b|m\.?\s?ed|\bb\.?\s?ed/i.test(
      q,
    )
  ) {
    return 'Master'
  }

  if (/\bdiploma\b|d\.?\s?pt\b|sanitary inspector|fitter|cnc|welder|wireman|turner|rfm|iti/i.test(q)) {
    return 'Diploma'
  }

  if (
    /\b12\b|12th|hsc|h\.?\s?s\.?\s?c|intermediate|12\s?pass|12\s?paas|12\s?th|higher secondary|12\s?science|12\s?commerce|12\s?arts/i.test(
      q,
    )
  ) {
    return '12th'
  }

  if (/\b10\b|10th|ssc|s\.?\s?s\.?\s?c|matric|10\s?pass|10\s?paas|10\s?th|secondary/i.test(q)) {
    return '10th'
  }

  if (/\b11\b|11th|11\s?pass/i.test(q)) {
    return '12th'
  }

  if (/\b9\b|9th|8\s?pass|8th|6\s?pass|7\s?pass/i.test(q)) {
    return '10th'
  }

  return 'Other'
}
