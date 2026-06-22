/**
 * Shared Excel sync helpers — marker detection, form slice, row parsing.
 */

import * as fs from 'fs'
import * as path from 'path'
import XLSX from 'xlsx'
import {
  normalizeGender,
  normalizeMarital,
  parseExcelDate,
  type ParsedProfileRow,
} from './excel-row-utils'

export const ROOT = path.resolve(import.meta.dirname, '../..')
export const MAIN_FILE = path.join(ROOT, 'Rista Data.xlsx')
export const FORM_FILE = path.join(ROOT, 'Rishta Data Form Responses (Dont Touch _ Edit).xlsx')

export const MAIN_COL = {
  timestamp: 0,
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

export type ColumnMap = typeof MAIN_COL

export function mapFormColumns(headers: string[]): ColumnMap {
  const find = (re: RegExp, fallback: number) => {
    const i = headers.findIndex((h) => re.test(String(h)))
    return i >= 0 ? i : fallback
  }
  return {
    timestamp: find(/timestamp/i, 0),
    name: find(/name of boy/i, 1),
    gender: find(/^gender/i, 2),
    qualification: find(/qualification.*education/i, 3),
    currentProfile: find(/current profile/i, 5),
    fatherName: find(/father's name/i, 6),
    fatherOccupation: find(/father's occupation/i, 7),
    motherName: find(/mother's name/i, 8),
    city: find(/city.*village/i, 9),
    dob: find(/date of birth/i, 11),
    marital: find(/marital/i, 12),
    height: find(/height/i, 13),
    weight: find(/weight/i, 14),
    phone: find(/contact|whatsapp/i, 15),
    subCast: find(/68 sub|sub cast/i, 16),
  }
}

export function norm(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function normPhone(s: unknown): string {
  const d = norm(s).replace(/[^\d]/g, '')
  return d.length >= 10 ? d.slice(-10) : d
}

export function cell(row: unknown[], col: number): string {
  return String(row[col] ?? '').trim()
}

export interface ProfileFingerprint {
  line: number
  name: string
  nameNorm: string
  dob: string | null
  phone: string
  fatherNorm: string
  cityNorm: string
  subCastNorm: string
}

export interface FormRowEntry {
  line: number
  row: unknown[]
  fingerprint: ProfileFingerprint
  parsed: ParsedProfileRow
}

function toFingerprint(line: number, row: unknown[], col: ColumnMap): ProfileFingerprint | null {
  const name = cell(row, col.name)
  if (!name || name.startsWith('#')) return null
  return {
    line,
    name,
    nameNorm: norm(name),
    dob: parseExcelDate(row[col.dob]),
    phone: normPhone(row[col.phone]),
    fatherNorm: norm(row[col.fatherName]),
    cityNorm: norm(row[col.city]),
    subCastNorm: norm(row[col.subCast]),
  }
}

export function parseFormDataRow(row: unknown[], col: ColumnMap, line: number): FormRowEntry | null {
  const fp = toFingerprint(line, row, col)
  if (!fp) return null

  const dob = parseExcelDate(row[col.dob])
  if (!dob) return null

  const qualification = cell(row, col.qualification) || 'Other'
  const qualOther = cell(row, col.qualification + 1) || cell(row, col.qualification + 2)

  const parsed: ParsedProfileRow = {
    name: fp.name,
    gender: normalizeGender(cell(row, col.gender)),
    qualification,
    qualification_other: qualification === 'Other' ? qualOther || null : null,
    current_profile: cell(row, col.currentProfile) || '-',
    father_name: cell(row, col.fatherName) || '-',
    father_occupation: cell(row, col.fatherOccupation) || '-',
    mother_name: cell(row, col.motherName) || '-',
    city: cell(row, col.city) || '',
    date_of_birth: dob,
    marital_status: normalizeMarital(cell(row, col.marital)),
    height: cell(row, col.height) || '-',
    weight_other: cell(row, col.weight) || '-',
    parent_contact: cell(row, col.phone) || '-',
    sub_cast: cell(row, col.subCast) || '-',
    education_category: qualification === 'Other' ? qualOther : qualification,
  }

  return { line, row, fingerprint: fp, parsed }
}

export function loadSheet(filePath: string, useFormCols: boolean) {
  const wb = XLSX.readFile(filePath)
  const sheetName = wb.SheetNames[0]
  const data = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
    header: 1,
    defval: '',
  })
  const headers = (data[0] ?? []).map((h) => String(h ?? ''))
  const col = useFormCols ? mapFormColumns(headers) : MAIN_COL
  return { sheetName, headers, col, raw: data }
}

export function findMarkerInForm(
  mainLast: ProfileFingerprint,
  formProfiles: ProfileFingerprint[],
  mainSubCast: string,
): { index: number; method: string } {
  let idx = formProfiles.findIndex(
    (p) => p.nameNorm === mainLast.nameNorm && p.phone && p.phone === mainLast.phone,
  )
  if (idx >= 0) return { index: idx, method: 'name + phone' }

  if (mainLast.dob) {
    idx = formProfiles.findIndex(
      (p) => p.nameNorm === mainLast.nameNorm && p.dob === mainLast.dob,
    )
    if (idx >= 0) return { index: idx, method: 'name + DOB' }
  }

  for (let i = formProfiles.length - 1; i >= 0; i--) {
    if (formProfiles[i].nameNorm === mainLast.nameNorm) {
      return { index: i, method: 'name (last match)' }
    }
  }

  const sub = norm(mainSubCast)
  if (sub) {
    for (let i = formProfiles.length - 1; i >= 0; i--) {
      if (formProfiles[i].subCastNorm === sub) {
        return { index: i, method: `sub-cast "${mainSubCast}" (last in form)` }
      }
    }
  }

  return { index: -1, method: 'not found' }
}

export function loadNewFormRows(): {
  marker: { index: number; method: string }
  entries: FormRowEntry[]
} {
  if (!fs.existsSync(MAIN_FILE) || !fs.existsSync(FORM_FILE)) {
    throw new Error(`Excel files missing in ${ROOT}`)
  }

  const main = loadSheet(MAIN_FILE, false)
  const form = loadSheet(FORM_FILE, true)

  const mainFingerprints: ProfileFingerprint[] = []
  for (let i = 1; i < main.raw.length; i++) {
    const fp = toFingerprint(i + 1, main.raw[i] ?? [], main.col)
    if (fp) mainFingerprints.push(fp)
  }

  const mainLast = mainFingerprints[mainFingerprints.length - 1]
  if (!mainLast) throw new Error('No profile rows in main sheet')

  const mainLastRaw = main.raw[mainLast.line - 1] ?? []
  const subCastOnLastRow = cell(mainLastRaw, main.col.subCast)

  const formFingerprints: ProfileFingerprint[] = []
  for (let i = 1; i < form.raw.length; i++) {
    const fp = toFingerprint(i + 1, form.raw[i] ?? [], form.col)
    if (fp) formFingerprints.push(fp)
  }

  const marker = findMarkerInForm(mainLast, formFingerprints, subCastOnLastRow)
  const startLine = marker.index >= 0 ? formFingerprints[marker.index].line + 1 : 2

  const entries: FormRowEntry[] = []
  for (let i = startLine - 1; i < form.raw.length; i++) {
    const entry = parseFormDataRow(form.raw[i] ?? [], form.col, i + 1)
    if (entry) entries.push(entry)
  }

  return { marker, entries }
}

/** Keep last row per name+DOB within the import batch. */
export function dedupeFormEntries(entries: FormRowEntry[]): FormRowEntry[] {
  const map = new Map<string, FormRowEntry>()
  for (const e of entries) {
    const key = `${e.fingerprint.nameNorm}|${e.fingerprint.dob ?? ''}`
    const prev = map.get(key)
    if (!prev || e.line > prev.line) map.set(key, e)
  }
  return [...map.values()].sort((a, b) => a.line - b.line)
}

export function toDbRecord(parsed: ParsedProfileRow, status: 'pending' | 'approved') {
  return {
    name: parsed.name,
    gender: parsed.gender,
    qualification: parsed.qualification,
    qualification_other: parsed.qualification_other,
    current_profile: parsed.current_profile,
    father_name: parsed.father_name,
    father_occupation: parsed.father_occupation,
    mother_name: parsed.mother_name,
    city: parsed.city,
    city_other: null,
    date_of_birth: parsed.date_of_birth,
    marital_status: parsed.marital_status,
    height: parsed.height,
    weight_other: parsed.weight_other,
    parent_contact: parsed.parent_contact,
    sub_cast: parsed.sub_cast,
    education_category: parsed.education_category,
    status,
    approved_at: status === 'approved' ? new Date().toISOString() : null,
  }
}
