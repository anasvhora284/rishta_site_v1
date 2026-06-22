import Sanscript from 'sanscript'

/** Standard spellings that differ from raw ITRANS output. */
const PLACE_OVERRIDES: Record<string, string> = {
  GAMDI: 'ગામડી',
  VYARA: 'વ્યારા',
  KANJARI: 'કંજારી',
  KANIJ: 'કાનીજ',
  KASOR: 'કાસોર',
  KHANDALI: 'ખંડાલી',
  KHANDHLI: 'ખંડહળી',
  MALAVADA: 'માલાવડા',
  UTTARSANDA: 'ઉત્તરસંદ',
  'Virar (Mumbai)- Maharashtra': 'વિરાર (મુંબઈ), મહારાષ્ટ્ર',
  USA: 'યુ.એસ.એ.',
  Other: 'અન્ય',
}

/** Roman place name → Gujarati script (ITRANS via sanscript + manual fixes). */
export function toGujaratiPlaceName(code: string, englishName: string): string {
  if (PLACE_OVERRIDES[code]) return PLACE_OVERRIDES[code]

  const slug = englishName
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z\s-]/g, '')
    .trim()
    .replace(/\s+/g, ' ')

  if (!slug) return englishName

  const parts = slug.split(/[\s,-]+/).filter(Boolean)
  return parts.map((part) => Sanscript.t(part, 'itrans', 'gujarati')).join(' ')
}
