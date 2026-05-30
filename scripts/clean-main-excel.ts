/**
 * Clean first sheet of Rista Data.xlsx for import.
 * - Removes exact duplicates (keeps first row)
 * - Moves Boy/Girl names, under-18, junk rows to "Needs Review" sheet
 *
 * Usage: npx tsx scripts/clean-main-excel.ts
 * Output: ../Rista Data - Cleaned.xlsx
 */

import * as fs from 'fs'
import * as path from 'path'
import XLSX from 'xlsx'

const ROOT = path.resolve(import.meta.dirname, '../..')
const INPUT = path.join(ROOT, 'Rista Data.xlsx')
const OUTPUT = path.join(ROOT, 'Rista Data - Cleaned.xlsx')

const COL = {
  name: 1,
  gender: 2,
  dob: 9,
  phone: 13,
  fatherName: 5,
  city: 8,
} as const

function norm(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function normPhone(s: unknown): string {
  const d = norm(s).replace(/[^\d]/g, '')
  return d.length >= 10 ? d.slice(-10) : d
}

function parseDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  const str = String(value).trim()
  if (!str) return null
  if (/^\d+(\.\d+)?$/.test(str)) {
    const date = XLSX.SSF.parse_date_code(Number(str))
    if (date) return new Date(date.y, date.m - 1, date.d)
  }
  const parts = str.replace(/\//g, '-').split('-')
  if (parts.length === 3) {
    const [a, b, c] = parts.map((p) => parseInt(p, 10))
    if (parts[2].length === 4) return new Date(c, b - 1, a)
    if (parts[0].length === 4) return new Date(a, b - 1, c)
    if (c > 31) return new Date(c, b - 1, a)
    return new Date(parts[2] as unknown as number, b - 1, a)
  }
  return null
}

function ageAt(d: Date): number {
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

function isPlaceholderName(name: string): boolean {
  return /^(boy|girl|male|female|son|daughter|child|test|na|n\/a)$/i.test(name.trim())
}

function isJunkName(name: string): boolean {
  const n = name.trim()
  if (n.length <= 2) return true
  if (/^(abcd|xxx|test|name|profile)$/i.test(n)) return true
  return false
}

function isValidGender(gender: string): boolean {
  const g = gender.toLowerCase()
  return g.includes('male') || g.includes('female') || g.includes('પુરુષ') || g.includes('સ્ત્રી')
}

type RowRecord = {
  line: number
  row: unknown[]
  name: string
  nameNorm: string
  dob: Date | null
  phone: string
  exactKey: string
  nameDobKey: string
}

function classify(row: RowRecord): string | null {
  if (isPlaceholderName(row.name)) return 'Name is Boy/Girl (needs real name)'
  if (isJunkName(row.name)) return 'Invalid or test name'
  if (!row.dob || isNaN(row.dob.getTime())) return 'Missing or invalid date of birth'
  const age = ageAt(row.dob)
  if (age < 0) return 'Invalid date of birth'
  if (age < 18) return `Under 18 (age ${age})`
  if (age > 100) return `Unlikely age (${age}) — check DOB`
  const gender = String(row.row[COL.gender] ?? '').trim()
  if (gender && !isValidGender(gender)) return `Fix gender: "${gender}"`
  return null
}

function loadFirstSheet(filePath: string) {
  const wb = XLSX.readFile(filePath)
  const sheetName = wb.SheetNames[0]
  const data = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
    header: 1,
    defval: '',
  })
  return { sheetName, data }
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('Not found:', INPUT)
    process.exit(1)
  }

  const { sheetName, data } = loadFirstSheet(INPUT)
  const headers = data[0] ?? []
  const reviewHeader = [...headers, 'Original Row', 'Reason']

  const records: RowRecord[] = []
  for (let i = 1; i < data.length; i++) {
    const row = data[i] ?? []
    const name = String(row[COL.name] ?? '').trim()
    if (!name || name.startsWith('#')) continue

    const dob = parseDate(row[COL.dob])
    const phone = normPhone(row[COL.phone])
    const nameNorm = norm(name)
    const fatherNorm = norm(row[COL.fatherName])
    const cityNorm = norm(row[COL.city])

    records.push({
      line: i + 1,
      row,
      name,
      nameNorm,
      dob,
      phone,
      exactKey: [nameNorm, dob?.toISOString().slice(0, 10) ?? '', phone, fatherNorm, cityNorm].join('|'),
      nameDobKey: `${nameNorm}|${dob?.toISOString().slice(0, 10) ?? ''}`,
    })
  }

  const cleaned: unknown[][] = [headers]
  const duplicates: unknown[][] = [reviewHeader]
  const needsReview: unknown[][] = [reviewHeader]

  const seenExact = new Set<string>()
  const seenNameDob = new Set<string>()

  let stats = {
    input: records.length,
    kept: 0,
    dupExact: 0,
    dupNameDob: 0,
    review: 0,
  }

  for (const rec of records) {
    const reviewReason = classify(rec)
    if (reviewReason) {
      needsReview.push([...rec.row, rec.line, reviewReason])
      stats.review++
      continue
    }

    if (seenExact.has(rec.exactKey)) {
      duplicates.push([...rec.row, rec.line, 'Exact duplicate (same name, DOB, phone, father, city)'])
      stats.dupExact++
      continue
    }

    if (seenNameDob.has(rec.nameDobKey)) {
      duplicates.push([...rec.row, rec.line, 'Duplicate (same name and date of birth)'])
      stats.dupNameDob++
      continue
    }

    seenExact.add(rec.exactKey)
    seenNameDob.add(rec.nameDobKey)
    cleaned.push(rec.row)
    stats.kept++
  }

  const outWb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(outWb, XLSX.utils.aoa_to_sheet(cleaned), sheetName)
  XLSX.utils.book_append_sheet(outWb, XLSX.utils.aoa_to_sheet(duplicates), 'Removed - Duplicates')
  XLSX.utils.book_append_sheet(outWb, XLSX.utils.aoa_to_sheet(needsReview), 'Needs Review')

  XLSX.writeFile(outWb, OUTPUT)

  console.log('Cleaned main Excel written to:')
  console.log(' ', OUTPUT)
  console.log('')
  console.log('Summary:')
  console.log('  Input profiles:     ', stats.input)
  console.log('  Kept (sheet 1):     ', stats.kept)
  console.log('  Removed duplicates: ', stats.dupExact + stats.dupNameDob)
  console.log('    - exact:          ', stats.dupExact)
  console.log('    - name + DOB:     ', stats.dupNameDob)
  console.log('  Needs review:       ', stats.review)
  console.log('')
  console.log('Next: fix rows in "Needs Review", then use this file for migrate.')
}

main()
