import { QUALIFICATIONS } from '@/types/profile'

export type QualificationBucket = (typeof QUALIFICATIONS)[number]

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
