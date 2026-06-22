/** Canonical qualification options — `value` is stored in profiles.qualification. */
export interface CanonicalQualification {
  value: string
  nameEn: string
  nameGu: string
}

export const CANONICAL_QUALIFICATIONS: CanonicalQualification[] = [
  { value: '10th', nameEn: '10th Standard', nameGu: 'ધોરણ ૧૦' },
  { value: '12th', nameEn: '12th Standard', nameGu: 'ધોરણ ૧૨' },
  { value: 'Bachelor', nameEn: 'Bachelor', nameGu: 'સ્નાતક (બેચલર)' },
  { value: 'Diploma', nameEn: 'Diploma', nameGu: 'ડિપ્લોમા' },
  { value: 'Engineering', nameEn: 'Engineering', nameGu: 'એન્જિનિયરિંગ' },
  { value: 'Master', nameEn: 'Master', nameGu: 'સ્નાતકોત્તર (માસ્ટર)' },
  { value: 'Medical', nameEn: 'Medical', nameGu: 'મેડિકલ' },
  { value: 'Other', nameEn: 'Other', nameGu: 'અન્ય' },
]

export const QUALIFICATION_CODES = [
  '10th',
  '12th',
  'Bachelor',
  'Diploma',
  'Engineering',
  'Master',
  'Medical',
  'Other',
] as const

export type QualificationCode = (typeof QUALIFICATION_CODES)[number]

export const CANONICAL_QUALIFICATION_BY_VALUE = new Map(
  CANONICAL_QUALIFICATIONS.map((q) => [q.value, q]),
)
