import type { TFunction } from 'i18next'

export interface LocalizedLabel {
  code: string
  name_en: string
  name_gu: string
}

export function activeLanguage(lng: string): 'en' | 'gu' {
  return lng.startsWith('en') ? 'en' : 'gu'
}

export function collatorLocale(lng: string): string {
  return activeLanguage(lng) === 'en' ? 'en' : 'gu-IN'
}

export function compareLocalizedLabels(a: string, b: string, lng: string): number {
  return a.localeCompare(b, collatorLocale(lng), { sensitivity: 'base', numeric: true })
}

export function sortLocalizedRecords<T extends LocalizedLabel>(records: T[], lng: string): T[] {
  return [...records].sort((a, b) =>
    compareLocalizedLabels(localizedName(a, lng), localizedName(b, lng), lng),
  )
}

export function sortByDisplayLabel<T>(
  items: T[],
  lng: string,
  getLabel: (item: T) => string,
): T[] {
  return [...items].sort((a, b) =>
    compareLocalizedLabels(getLabel(a), getLabel(b), lng),
  )
}

export function localizedName(record: LocalizedLabel | undefined, lng: string, fallback = ''): string {
  if (!record) return fallback
  return activeLanguage(lng) === 'en' ? record.name_en || fallback : record.name_gu || record.name_en || fallback
}

export function localizedQualification(code: string, t: TFunction, fallback?: string): string {
  const key = `qualifications.${code}`
  const translated = t(key)
  return translated === key ? (fallback ?? code) : translated
}

export function buildLabelMap<T extends LocalizedLabel>(records: T[]): Map<string, T> {
  return new Map(records.map((r) => [r.code, r]))
}
