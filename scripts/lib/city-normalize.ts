/**
 * City normalization rules for cleanup preview and apply migration.
 */

import {
  CANONICAL_CITIES,
  CITY_ALIASES_TO_CODE,
  isOtherCity,
} from '../../src/data/canonical-cities'

export interface NormalizedCity {
  city: string
  cityOther: string | null
  method: 'exact' | 'alias' | 'contains' | 'unchanged' | 'other'
}

/** Raw values left untouched — verified correct or pending manual review. */
export const LEAVE_UNCHANGED_CITY_KEYS = new Set([
  'anghadi',
  'bandhni',
  'malvan',
  'navakhal',
  'anklav',
  'navli',
  'gana',
  'salun',
  'notprovided',
  'virar mumbai maharashtra',
])

/** Strip punctuation/spacing for fuzzy key matching. */
export function cityKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0a80-\u0aff]/g, '')
}

function preferCanonical(a: string, b: string): string {
  const aUpper = a === a.toUpperCase() && a.length > 2
  const bUpper = b === b.toUpperCase() && b.length > 2
  if (aUpper && !bUpper) return a
  if (bUpper && !aUpper) return b
  return a.length >= b.length ? a : b
}

/** One canonical label per place from the app's city list. */
export function buildCanonicalCityMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const { code } of CANONICAL_CITIES) {
    if (isOtherCity(code)) continue
    const key = cityKey(code)
    const prev = map.get(key)
    map.set(key, prev ? preferCanonical(prev, code) : code)
  }
  return map
}

const CANONICAL_BY_KEY = buildCanonicalCityMap()

/** Sorted longest-first for substring extraction from addresses. */
const CANONICAL_SEARCH = [...CANONICAL_BY_KEY.entries()]
  .map(([key, label]) => ({ key, label, len: key.length }))
  .sort((a, b) => b.len - a.len)

const CITY_ALIASES: Record<string, string> = {
  ahemdabad: 'AHMEDABAD',
  amdavad: 'AHMEDABAD',
  ahemadabad: 'AHMEDABAD',
  ahmedabadcity: 'AHMEDABAD',
  ahmedabadgujarat: 'AHMEDABAD',
  ahmedabadkalupur: 'AHMEDABAD',
  ahmedabadvatva: 'AHMEDABAD',
  danilimdaahmedabad: 'AHMEDABAD',
  baroda: 'VADODARA',
  vadodra: 'VADODARA',
  vadodaracity: 'VADODARA',
  tandaljavadodara: 'VADODARA',
  tandaljavadodra: 'VADODARA',
  gorwavadodara: 'VADODARA',
  aanad: 'ANAND',
  annad: 'ANAND',
  anandi: 'ANAND',
  anand2: 'ANAND',
  anandgujarat: 'ANAND',
  anandcity: 'ANAND',
  anandcitygujrat: 'ANAND',
  naadiyad: 'NADIAD',
  nadiyad: 'NADIAD',
  ndeiad: 'NADIAD',
  ndeyd: 'NADIAD',
  nadeyad: 'NADIAD',
  ndiad: 'NADIAD',
  nadiaddabhan: 'NADIAD',
  dabhannadiad: 'NADIAD',
  petalad: 'PETLAD',
  petladcity: 'PETLAD',
  mahemdabad: 'MAHEMDAVAD',
  mahemadabad: 'MAHEMDAVAD',
  mahemadavad: 'MAHEMDAVAD',
  mehamadabad: 'MAHEMDAVAD',
  mehamdabad: 'MAHEMDAVAD',
  mehmdavad: 'MAHEMDAVAD',
  memdavad: 'MAHEMDAVAD',
  mhemdava: 'MAHEMDAVAD',
  mhemdavaad: 'MAHEMDAVAD',
  mahemdabab: 'MAHEMDAVAD',
  kathalal: 'KATHLAL',
  kathlal0: 'KATHLAL',
  kapadavanj: 'KAPADWANJ',
  kapadvanj: 'KAPADWANJ',
  kapdwanj: 'KAPADWANJ',
  kosindra: 'KOSINDRA',
  bhadrva: 'BHADARVA',
  bhaleg: 'BHALEJ',
  borasad: 'BORSAD',
  alarsha: 'ALARSA',
  alarsaborsad: 'ALARSA',
  napad: 'NAPA',
  napadanand: 'NAPA',
  umeta: 'UMETHA',
  sojittra: 'SOJITRA',
  umrethanand: 'UMRETH',
  umrethdisanand: 'UMRETH',
  umrethdistrictanand: 'UMRETH',
  changapetladanand: 'CHANGA',
  changapetladdistanand: 'CHANGA',
  kasornowmovedinanandcity: 'KASOR',
  kasorsojitra: 'KASOR',
  uttarsandacurrentlyinanand: 'UTTARSANDA',
  uttarsandacurrentlylivinginanand: 'UTTARSANDA',
  vallabhvidhyanagaanand: 'ANAND',
  mandvisurathalanand: 'ANAND',
  bharuchnativepetlad: 'PETLAD',
  borsadras: 'BORSAD',
  rasborsad: 'RAS',
  finavkhambhat: 'KHAMBHAT',
  paguthanbharuch: 'BHARUCH',
  padraadodara: 'PADRA',
  padraadodra: 'PADRA',
  maladpathanvadi: 'MUMBAI',
  mumbaimaladpathanwadi: 'MUMBAI',
  usa: 'USA',
  us: 'USA',
  varjiniyarusa: 'USA',
  columbiamarilandusa: 'USA',
  chicago: 'USA',
  dubai: 'DUBAI',
  ukoriginallyfromkathlal: 'KATHLAL',
  basicallyfromsouthafricalesothobutcurrentlylivinginanandgujarat: 'ANAND',
  gorwamadhunagar: 'VADODARA',
  mhemdavad: 'MAHEMDAVAD',
  naar: 'NAR',
  vakanersavali: 'WAKANER',
  vankanersavli: 'WAKANER',
  બાલાપીરભાગોળમુખેડાજીખેડા: 'KHEDA',
  city: 'OTHER',
  gujarat: 'OTHER',
  housewife: 'OTHER',
  notprovided: 'OTHER',
  ઉમરેઠ: 'UMRETH',
  નડીઆદ: 'NADIAD',
}

for (const [label, code] of Object.entries(CITY_ALIASES_TO_CODE)) {
  const k = cityKey(label)
  if (k) CITY_ALIASES[k] = code
}

const JUNK_PATTERNS = [
  /^city$/i,
  /^gujarat$/i,
  /^house\s*wife$/i,
  /^no$/i,
  /^-+$/,
]

export function normalizeCityValue(rawInput: string | null | undefined): NormalizedCity {
  const raw = String(rawInput ?? '').trim()
  if (!raw) {
    return { city: 'OTHER', cityOther: null, method: 'other' }
  }

  if (JUNK_PATTERNS.some((re) => re.test(raw))) {
    return { city: 'OTHER', cityOther: raw, method: 'other' }
  }

  const key = cityKey(raw)
  if (!key) {
    return { city: 'OTHER', cityOther: raw, method: 'other' }
  }

  const exact = CANONICAL_BY_KEY.get(key)
  if (exact) {
    const unchanged = raw === exact && !raw.includes(',')
    return {
      city: exact,
      cityOther: null,
      method: unchanged ? 'unchanged' : 'exact',
    }
  }

  const alias = CITY_ALIASES[key]
  if (alias) {
    return { city: alias, cityOther: raw !== alias ? raw : null, method: 'alias' }
  }

  for (const { key: placeKey, label } of CANONICAL_SEARCH) {
    if (placeKey.length >= 4 && key.includes(placeKey)) {
      return {
        city: label,
        cityOther: raw,
        method: 'contains',
      }
    }
  }

  // Try comma / slash segments (e.g. "Changa, Petlad, Dist: Anand")
  const segments = raw
    .split(/[,;/|]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  for (const segment of [...segments].reverse()) {
    const segKey = cityKey(segment.replace(/\b(dist|district|ta|taluka|di|dis|m|mu|j|g)\b\.?/gi, ''))
    const segExact = CANONICAL_BY_KEY.get(segKey)
    if (segExact) {
      return { city: segExact, cityOther: raw, method: 'contains' }
    }
    const segAlias = CITY_ALIASES[segKey]
    if (segAlias) {
      return { city: segAlias, cityOther: raw, method: 'contains' }
    }
  }

  return { city: 'OTHER', cityOther: raw, method: 'other' }
}

/** Whether this row should be updated during apply (skips low-confidence / unknown). */
export function shouldApplyCityCleanup(
  beforeCity: string,
  beforeCityOther: string | null,
  normalized: NormalizedCity,
): boolean {
  const input =
    isOtherCity(beforeCity) && beforeCityOther ? beforeCityOther : beforeCity
  const beforeKey = cityKey(input)

  if (LEAVE_UNCHANGED_CITY_KEYS.has(beforeKey)) return false
  if (isOtherCity(beforeCity) && !beforeCityOther?.trim()) return false
  if (normalized.method === 'other') return false

  const afterOther = normalized.cityOther ?? null
  const unchanged =
    normalized.city === beforeCity && (afterOther ?? null) === (beforeCityOther ?? null)
  return !unchanged
}
