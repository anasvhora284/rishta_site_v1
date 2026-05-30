/**
 * Compare first sheet only:
 * - Rista Data.xlsx = current main list
 * - Form Responses = only rows AFTER the main's last-row marker in form sheet
 *
 * Marker: last data row on main sheet; find same row in form (name + phone),
 * then analyze form rows below that line for duplicates vs main.
 *
 * Usage: npx tsx scripts/analyze-excel-first-sheet.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import XLSX from 'xlsx'

const ROOT = path.resolve(import.meta.dirname, '../..')
const MAIN_FILE = path.join(ROOT, 'Rista Data.xlsx')
const FORM_FILE = path.join(ROOT, 'Rishta Data Form Responses (Dont Touch _ Edit).xlsx')

const COL = {
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

/** Form sheet column order differs — map by header keyword */
function mapFormColumns(headers: string[]): typeof COL {
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

function parseDate(value: unknown): string | null {
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
  return str.length >= 8 ? str : null
}

interface ProfileRow {
  line: number
  name: string
  nameNorm: string
  dob: string | null
  phone: string
  fatherNorm: string
  cityNorm: string
  subCastNorm: string
  gender: string
}

function toProfile(line: number, row: unknown[], col: typeof COL): ProfileRow | null {
  const name = String(row[col.name] ?? '').trim()
  if (!name || name.startsWith('#')) return null
  return {
    line,
    name,
    nameNorm: norm(name),
    dob: parseDate(row[col.dob]),
    phone: normPhone(row[col.phone]),
    fatherNorm: norm(row[col.fatherName]),
    cityNorm: norm(row[col.city]),
    subCastNorm: norm(row[col.subCast]),
    gender: String(row[col.gender] ?? '').trim(),
  }
}

function loadFirstSheet(filePath: string, useFormCols: boolean) {
  const wb = XLSX.readFile(filePath)
  const sheetName = wb.SheetNames[0]
  const data = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
    header: 1,
    defval: '',
  })
  const headers = (data[0] ?? []).map((h) => String(h ?? ''))
  const col = useFormCols ? mapFormColumns(headers) : COL
  const profiles: ProfileRow[] = []
  for (let i = 1; i < data.length; i++) {
    const p = toProfile(i + 1, data[i] ?? [], col)
    if (p) profiles.push(p)
  }
  return { sheetName, profiles, col, raw: data }
}

function lastDataRow(profiles: ProfileRow[]) {
  return profiles[profiles.length - 1] ?? null
}

function findMarkerInForm(
  mainLast: ProfileRow,
  formProfiles: ProfileRow[],
  mainSubCastValue: string,
): { index: number; method: string } {
  // 1) Exact name + phone
  let idx = formProfiles.findIndex(
    (p) => p.nameNorm === mainLast.nameNorm && p.phone && p.phone === mainLast.phone,
  )
  if (idx >= 0) return { index: idx, method: 'name + phone' }

  // 2) Exact name + DOB
  if (mainLast.dob) {
    idx = formProfiles.findIndex(
      (p) => p.nameNorm === mainLast.nameNorm && p.dob === mainLast.dob,
    )
    if (idx >= 0) return { index: idx, method: 'name + DOB' }
  }

  // 3) Exact name (last occurrence — aligns with sheet sync point)
  for (let i = formProfiles.length - 1; i >= 0; i--) {
    if (formProfiles[i].nameNorm === mainLast.nameNorm) {
      return { index: i, method: 'name (last match)' }
    }
  }

  // 4) User hint: last column value from main's last row — find last row in form with same sub-cast
  const sub = norm(mainSubCastValue)
  if (sub) {
    for (let i = formProfiles.length - 1; i >= 0; i--) {
      if (formProfiles[i].subCastNorm === sub) {
        return { index: i, method: `sub-cast "${mainSubCastValue}" (last in form)` }
      }
    }
  }

  return { index: -1, method: 'not found' }
}

function dupGroups(
  profiles: ProfileRow[],
  keyFn: (p: ProfileRow) => string,
): { key: string; items: ProfileRow[] }[] {
  const map = new Map<string, ProfileRow[]>()
  for (const p of profiles) {
    const key = keyFn(p)
    if (!key) continue
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return [...map.entries()]
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) => ({ key, items }))
}

function main() {
  if (!fs.existsSync(MAIN_FILE) || !fs.existsSync(FORM_FILE)) {
    console.error('Excel file(s) missing in', ROOT)
    process.exit(1)
  }

  const main = loadFirstSheet(MAIN_FILE, false)
  const form = loadFirstSheet(FORM_FILE, true)

  const mainLast = lastDataRow(main.profiles)
  if (!mainLast) {
    console.error('No profile rows in main sheet')
    process.exit(1)
  }

  const mainLastRaw = main.raw[mainLast.line - 1] ?? []
  const lastColIndex = (main.raw[0] ?? []).length - 1
  let lastColIdx = lastColIndex
  for (let c = lastColIndex; c >= 0; c--) {
    const header = String((main.raw[0] ?? [])[c] ?? '').trim()
    const hasData = main.profiles.some((p) => {
      const row = main.raw[p.line - 1] ?? []
      return String(row[c] ?? '').trim()
    })
    if (header && hasData) {
      lastColIdx = c
      break
    }
  }
  const lastColValue = String(mainLastRaw[lastColIdx] ?? '').trim()
  const subCastOnLastRow = String(mainLastRaw[main.col.subCast] ?? '').trim()

  const marker = findMarkerInForm(mainLast, form.profiles, subCastOnLastRow)
  const formNewOnly =
    marker.index >= 0 ? form.profiles.slice(marker.index + 1) : form.profiles

  console.log('='.repeat(64))
  console.log('FIRST SHEET ONLY — duplicate & redundancy report')
  console.log('='.repeat(64))
  console.log(`\nMain: ${path.basename(MAIN_FILE)} → "${main.sheetName}"`)
  console.log(`  Profile rows (with name): ${main.profiles.length}`)
  console.log(`  Last profile row: line ${mainLast.line}`)
  console.log(`    Name: ${mainLast.name}`)
  console.log(`    Phone: ${mainLast.phone || '(empty)'}`)
  console.log(`    DOB: ${mainLast.dob ?? '(empty)'}`)
  console.log(`    Sub-cast (col ${main.col.subCast}): ${subCastOnLastRow}`)
  console.log(
    `    Last populated column: col ${lastColIdx} = "${lastColValue || subCastOnLastRow}"`,
  )

  console.log(`\nForm: ${path.basename(FORM_FILE)} → "${form.sheetName}"`)
  console.log(`  Total profile rows: ${form.profiles.length}`)
  console.log(`  Sync marker in form: ${marker.method}`)
  if (marker.index >= 0) {
    const at = form.profiles[marker.index]
    console.log(`    Matched at form line ${at.line}: ${at.name}`)
    console.log(`  Rows BELOW marker (new this year): ${formNewOnly.length}`)
  } else {
    console.log('  ⚠ Could not find marker — showing full form sheet as "new"')
  }

  // Duplicates within main
  const mainDupExact = dupGroups(main.profiles, (p) =>
    [p.nameNorm, p.dob ?? '', p.phone, p.fatherNorm, p.cityNorm].join('|'),
  )
  const mainDupNameDob = dupGroups(main.profiles, (p) => `${p.nameNorm}|${p.dob ?? ''}`)
  const mainDupNamePhone = dupGroups(main.profiles, (p) =>
    p.phone ? `${p.nameNorm}|${p.phone}` : '',
  )

  console.log('\n--- Duplicates WITHIN main (current list) ---')
  console.log(`  Exact duplicate groups: ${mainDupExact.length}`)
  for (const g of mainDupExact.slice(0, 15)) {
    console.log(
      `    ${g.items.map((p) => `L${p.line} ${p.name}`).join(' | ')}`,
    )
  }
  if (mainDupExact.length > 15) console.log(`    ... +${mainDupExact.length - 15} more groups`)

  console.log(`  Same name + DOB groups: ${mainDupNameDob.length}`)
  for (const g of mainDupNameDob.slice(0, 10)) {
    const phones = [...new Set(g.items.map((p) => p.phone || 'none'))]
    console.log(
      `    ${g.items.map((p) => `L${p.line}`).join(', ')} — ${g.items[0].name}${phones.length > 1 ? ' [different phones]' : ''}`,
    )
  }

  // Duplicates within new form slice only
  const newDupExact = dupGroups(formNewOnly, (p) =>
    [p.nameNorm, p.dob ?? '', p.phone, p.fatherNorm, p.cityNorm].join('|'),
  )
  const newDupNameDob = dupGroups(formNewOnly, (p) => `${p.nameNorm}|${p.dob ?? ''}`)

  console.log('\n--- Duplicates WITHIN new form rows only (below marker) ---')
  console.log(`  Exact duplicate groups: ${newDupExact.length}`)
  for (const g of newDupExact) {
    console.log(`    ${g.items.map((p) => `L${p.line} ${p.name}`).join(' | ')}`)
  }
  console.log(`  Same name + DOB groups: ${newDupNameDob.length}`)
  for (const g of newDupNameDob) {
    console.log(
      `    ${g.items.map((p) => `L${p.line} ph=${p.phone || '?'}`).join(' | ')} — ${g.items[0].name}`,
    )
  }

  // Cross: new form rows already in main
  const mainKeys = new Set(
    main.profiles.map((p) => [p.nameNorm, p.dob ?? '', p.phone].join('|')),
  )
  const mainNameDob = new Set(main.profiles.map((p) => `${p.nameNorm}|${p.dob ?? ''}`))
  const alreadyInMain = formNewOnly.filter((p) => mainNameDob.has(`${p.nameNorm}|${p.dob ?? ''}`))
  const alreadyExact = formNewOnly.filter((p) =>
    mainKeys.has([p.nameNorm, p.dob ?? '', p.phone].join('|')),
  )

  console.log('\n--- New form rows that ALREADY exist in main ---')
  console.log(`  Same name + DOB: ${alreadyInMain.length} row(s) — safe to skip on import`)
  for (const p of alreadyInMain.slice(0, 20)) {
    console.log(`    L${p.line} ${p.name} (${p.dob ?? 'no dob'})`)
  }
  if (alreadyInMain.length > 20) console.log(`    ... +${alreadyInMain.length - 20} more`)

  console.log(`  Exact match (name+dob+phone): ${alreadyExact.length}`)

  const trulyNew = formNewOnly.filter(
    (p) => !mainNameDob.has(`${p.nameNorm}|${p.dob ?? ''}`),
  )
  const emptyOrWeak = formNewOnly.filter((p) => !p.dob && !p.phone)

  console.log('\n' + '='.repeat(64))
  console.log('SUMMARY')
  console.log('='.repeat(64))
  console.log(`Main list (use as-is):           ${main.profiles.length} profiles`)
  console.log(
    `Remove from main (exact dupes):   ~${mainDupExact.reduce((a, g) => a + g.items.length - 1, 0)} rows`,
  )
  console.log(
    `Remove from main (name+DOB dup):  ~${mainDupNameDob.reduce((a, g) => a + g.items.length - 1, 0)} rows`,
  )
  console.log(`Form — ignore (above marker):     ${marker.index >= 0 ? marker.index + 1 : 0} rows`)
  console.log(`Form — new slice (below marker):  ${formNewOnly.length} rows`)
  console.log(`  Already in main (skip):         ${alreadyInMain.length}`)
  console.log(`  Truly new to import:            ${trulyNew.length}`)
  console.log(`  New but missing dob+phone:      ${emptyOrWeak.length} (review manually)`)
  console.log(
    `\nAfter cleanup: ~${main.profiles.length - mainDupNameDob.reduce((a, g) => a + g.items.length - 1, 0)} in main + ~${trulyNew.length} new pending`,
  )
}

main()
