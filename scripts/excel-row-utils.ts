import XLSX from 'xlsx'

/** Column indices — first sheet of Rista / cleaned export */
export const MAIN_COL = {
  name: 1,
  gender: 2,
  qualification: 3,
  currentProfile: 4,
  fatherName: 5,
  fatherOccupation: 6,
  motherName: 7,
  city: 8,
  dob: 9,
  marital: 10,
  height: 11,
  weight: 12,
  phone: 13,
  subCast: 14,
} as const

export function parseExcelDate(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const str = String(value).trim()
  if (!str) return null
  if (/^\d+(\.\d+)?$/.test(str)) {
    const date = XLSX.SSF.parse_date_code(Number(str))
    if (date) {
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${date.y}-${pad(date.m)}-${pad(date.d)}`
    }
  }
  const parts = str.replace(/\//g, '-').split('-')
  if (parts.length === 3) {
    const [a, b, c] = parts
    if (c.length === 4) return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`
    if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`
  }
  if (str.includes('T')) return str.slice(0, 10)
  return null
}

export function normalizeGender(value: string): 'male' | 'female' {
  const v = value.toLowerCase()
  if (v.includes('female') || v.includes('girl') || v.includes('સ્ત્રી') || v === 'f') {
    return 'female'
  }
  return 'male'
}

export function normalizeMarital(value: string): 'unmarried' | 'divorce' | 'widowed' {
  const v = value.toLowerCase()
  if (v.includes('divorce')) return 'divorce'
  if (v.includes('widow')) return 'widowed'
  return 'unmarried'
}

export function cell(row: unknown[], col: number): string {
  return String(row[col] ?? '').trim()
}

export interface ParsedProfileRow {
  name: string
  gender: 'male' | 'female'
  qualification: string
  qualification_other: string | null
  current_profile: string
  father_name: string
  father_occupation: string
  mother_name: string
  city: string
  date_of_birth: string
  marital_status: 'unmarried' | 'divorce' | 'widowed'
  height: string
  weight_other: string
  parent_contact: string
  sub_cast: string
  education_category: string
}

export function parseMainSheetRow(row: unknown[]): ParsedProfileRow | null {
  const name = cell(row, MAIN_COL.name)
  if (!name || name.startsWith('#')) return null

  const dob = parseExcelDate(row[MAIN_COL.dob])
  if (!dob) return null

  const qualification = cell(row, MAIN_COL.qualification) || 'Other'
  const qualOtherCol = cell(row, 15) || cell(row, 16)

  return {
    name,
    gender: normalizeGender(cell(row, MAIN_COL.gender)),
    qualification,
    qualification_other: qualification === 'Other' ? qualOtherCol || null : null,
    current_profile: cell(row, MAIN_COL.currentProfile) || '-',
    father_name: cell(row, MAIN_COL.fatherName) || '-',
    father_occupation: cell(row, MAIN_COL.fatherOccupation) || '-',
    mother_name: cell(row, MAIN_COL.motherName) || '-',
    city: cell(row, MAIN_COL.city) || 'Not Provided',
    date_of_birth: dob,
    marital_status: normalizeMarital(cell(row, MAIN_COL.marital)),
    height: cell(row, MAIN_COL.height) || '-',
    weight_other: cell(row, MAIN_COL.weight) || '-',
    parent_contact: cell(row, MAIN_COL.phone) || '-',
    sub_cast: cell(row, MAIN_COL.subCast) || '-',
    education_category: qualification === 'Other' ? qualOtherCol : qualification,
  }
}

export function loadMainSheetRows(filePath: string): unknown[][] {
  const wb = XLSX.readFile(filePath)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
  return data.slice(1)
}
