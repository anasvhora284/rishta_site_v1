/** Canonical city codes stored in profiles.city — authoritative EN/GU labels. */
export interface CanonicalCity {
  code: string
  nameEn: string
  nameGu: string
}

/** User-provided master list (code = stored value in profiles.city). */
export const CANONICAL_CITIES: CanonicalCity[] = [
  { code: 'AHMEDABAD', nameEn: 'Ahmedabad', nameGu: 'અમદાવાદ' },
  { code: 'AJARPURA', nameEn: 'Ajarpura', nameGu: 'અજરપુરા' },
  { code: 'ALARSA', nameEn: 'Alarsa', nameGu: 'અલારસા' },
  { code: 'ANAND', nameEn: 'Anand', nameGu: 'આણંદ' },
  { code: 'ANGHADI', nameEn: 'Anghadi', nameGu: 'અંગાઢી' },
  { code: 'ANKLAV', nameEn: 'Anklav', nameGu: 'અંકલાવ' },
  { code: 'ANKLESHWAR', nameEn: 'Ankleshwar', nameGu: 'અંકલેશ્વર' },
  { code: 'ASOJ', nameEn: 'Asoj', nameGu: 'આસોજ' },
  { code: 'BAHIYAL', nameEn: 'Bahiyal', nameGu: 'બહિયલ' },
  { code: 'BANDHNI', nameEn: 'Bandhni', nameGu: 'બાંધણી' },
  { code: 'BHADARVA', nameEn: 'Bhadarva', nameGu: 'ભાદરવા' },
  { code: 'BHALEJ', nameEn: 'Bhalej', nameGu: 'ભાલેજ' },
  { code: 'BHARUCH', nameEn: 'Bharuch', nameGu: 'ભરૂચ' },
  { code: 'BORSAD', nameEn: 'Borsad', nameGu: 'બોરસદ' },
  { code: 'CHANGA', nameEn: 'Changa', nameGu: 'ચાંગા' },
  { code: 'DAKOR', nameEn: 'Dakor', nameGu: 'ડાકોર' },
  { code: 'DUBAI', nameEn: 'Dubai', nameGu: 'દુબઈ' },
  { code: 'GAMDI', nameEn: 'Gamdi', nameGu: 'ગામડી' },
  { code: 'GANA', nameEn: 'Gana', nameGu: 'ગાણા' },
  { code: 'GANDHINAGAR', nameEn: 'Gandhinagar', nameGu: 'ગાંધીનગર' },
  { code: 'KALSAR', nameEn: 'Kalsar', nameGu: 'કલસર' },
  { code: 'KANIJ', nameEn: 'Kanij', nameGu: 'કનીજ' },
  { code: 'KANJARI', nameEn: 'Kanjari', nameGu: 'કંજારી' },
  { code: 'KAPADWANJ', nameEn: 'Kapadwanj', nameGu: 'કપડવંજ' },
  { code: 'KASOR', nameEn: 'Kasor', nameGu: 'કાસોર' },
  { code: 'KATHLAL', nameEn: 'Kathlal', nameGu: 'કઠલાલ' },
  { code: 'KHAMBHAT', nameEn: 'Khambhat', nameGu: 'ખંભાત' },
  { code: 'KHANDALI', nameEn: 'Khandali', nameGu: 'ખંડાળી' },
  { code: 'KHEDA', nameEn: 'Kheda', nameGu: 'ખેડા' },
  { code: 'KOSINDRA', nameEn: 'Kosindra', nameGu: 'કોસિન્દ્રા' },
  { code: 'MAHEMDAVAD', nameEn: 'Mahemdavad', nameGu: 'મહેમદાવાદ' },
  { code: 'MAHESANA', nameEn: 'Mahesana', nameGu: 'મહેસાણા' },
  { code: 'MAHUDHA', nameEn: 'Mahudha', nameGu: 'મહુધા' },
  { code: 'MALAVADA', nameEn: 'Malavada', nameGu: 'માલાવાડા' },
  { code: 'MALVAN', nameEn: 'Malvan', nameGu: 'માલવણ' },
  { code: 'MANDVI', nameEn: 'Mandvi', nameGu: 'માંડવી' },
  { code: 'MOGAR', nameEn: 'Mogar', nameGu: 'મોગર' },
  { code: 'MUMBAI', nameEn: 'Mumbai', nameGu: 'મુંબઈ' },
  { code: 'NADIAD', nameEn: 'Nadiad', nameGu: 'નડિયાદ' },
  { code: 'NAPA', nameEn: 'Napa', nameGu: 'નાપા' },
  { code: 'NAR', nameEn: 'Nar', nameGu: 'નાર' },
  { code: 'NAVAKHAL', nameEn: 'Navakhal', nameGu: 'નવાખલ' },
  { code: 'NAVLI', nameEn: 'Navli', nameGu: 'નાવલી' },
  { code: 'NAVSARI', nameEn: 'Navsari', nameGu: 'નવસારી' },
  { code: 'OD', nameEn: 'Od', nameGu: 'ઓડ' },
  { code: 'PADRA', nameEn: 'Padra', nameGu: 'પાદરા' },
  { code: 'PANSORA', nameEn: 'Pansora', nameGu: 'પાંસોરા' },
  { code: 'PETLAD', nameEn: 'Petlad', nameGu: 'પેટલાદ' },
  { code: 'PIPLAG', nameEn: 'Piplag', nameGu: 'પીપળગ' },
  { code: 'RAS', nameEn: 'Ras', nameGu: 'રાસ' },
  { code: 'RUDAN', nameEn: 'Rudan', nameGu: 'રૂદન' },
  { code: 'SALUN', nameEn: 'Salun', nameGu: 'સાલુણ' },
  { code: 'SANJAN', nameEn: 'Sanjan', nameGu: 'સંજાણ' },
  { code: 'SEVALIYA', nameEn: 'Sevaliya', nameGu: 'સેવાલિયા' },
  { code: 'SOJITRA', nameEn: 'Sojitra', nameGu: 'સોજીત્રા' },
  { code: 'SURAT', nameEn: 'Surat', nameGu: 'સુરત' },
  { code: 'SURELI', nameEn: 'Sureli', nameGu: 'સુરેલી' },
  { code: 'TARAPUR', nameEn: 'Tarapur', nameGu: 'તારાપુર' },
  { code: 'THASRA', nameEn: 'Thasra', nameGu: 'ઠાસરા' },
  { code: 'UMETHA', nameEn: 'Umetha', nameGu: 'ઉમેઠા' },
  { code: 'UMRETH', nameEn: 'Umreth', nameGu: 'ઉમરેઠ' },
  { code: 'USA', nameEn: 'USA', nameGu: 'યુ.એસ.એ.' },
  { code: 'UTTARSANDA', nameEn: 'Uttarsanda', nameGu: 'ઉત્તરસંડા' },
  { code: 'VADODARA', nameEn: 'Vadodara', nameGu: 'વડોદરા' },
  { code: 'VALASAN', nameEn: 'Valasan', nameGu: 'વાલાસણ' },
  { code: 'VANSOL', nameEn: 'Vansol', nameGu: 'વાંસોલ' },
  { code: 'VASAD', nameEn: 'Vasad', nameGu: 'વાસદ' },
  { code: 'VASNA', nameEn: 'Vasna', nameGu: 'વાસણા' },
  { code: 'VASO', nameEn: 'Vaso', nameGu: 'વાસો' },
  { code: 'VIRAR', nameEn: 'Virar', nameGu: 'વિરાર' },
  { code: 'VIRSAD', nameEn: 'Virsad', nameGu: 'વીરસદ' },
  { code: 'VYARA', nameEn: 'Vyara', nameGu: 'વ્યારા' },
  { code: 'WAKANER', nameEn: 'Wakaner', nameGu: 'વાંકાનેર' },
  { code: 'OTHER', nameEn: 'Other', nameGu: 'અન્ય' },
]

/** Legacy profile/form values → canonical uppercase code. */
export const CITY_ALIASES_TO_CODE: Record<string, string> = {
  Ajarpura: 'AJARPURA',
  Borsad: 'BORSAD',
  Khambhat: 'KHAMBHAT',
  Mahemdavad: 'MAHEMDAVAD',
  'Kalsar (dakor)': 'KALSAR',
  Anghadi: 'ANGHADI',
  Anklav: 'ANKLAV',
  Bandhni: 'BANDHNI',
  Gana: 'GANA',
  Malvan: 'MALVAN',
  Navakhal: 'NAVAKHAL',
  Navli: 'NAVLI',
  Salun: 'SALUN',
  Wakaner: 'WAKANER',
  Other: 'OTHER',
  ODE: 'OD',
  KHANDHLI: 'KHANDALI',
  'Virar (Mumbai)- Maharashtra': 'VIRAR',
  'Virar (Mumbai), Maharashtra': 'VIRAR',
}

export const CANONICAL_CITY_CODES = new Set(CANONICAL_CITIES.map((c) => c.code))

export const CANONICAL_CITY_BY_CODE = new Map(CANONICAL_CITIES.map((c) => [c.code, c]))

export function isOtherCity(code: string): boolean {
  return code === 'OTHER' || code === 'Other'
}

/** Legacy "not provided" values — no longer a dropdown option. */
export function isLegacyNotProvidedCity(code: string): boolean {
  return code === 'NOT PROVIDED' || code === 'Not Provided'
}

/** Resolve legacy or alias label to canonical code. */
export function resolveCityCode(raw: string): string {
  const trimmed = raw.trim()
  if (isLegacyNotProvidedCity(trimmed)) return 'OTHER'
  if (CANONICAL_CITY_BY_CODE.has(trimmed)) return trimmed
  return CITY_ALIASES_TO_CODE[trimmed] ?? trimmed
}
