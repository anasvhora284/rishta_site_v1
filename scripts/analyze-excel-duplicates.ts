/**
 * Analyze Excel files for duplicate / redundant rows.
 * Usage: npx tsx scripts/analyze-excel-duplicates.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import XLSX from 'xlsx'

const ROOT = path.resolve(import.meta.dirname, '../..')

const FILES = [
  { label: 'Rista Data.xlsx (main / approved)', path: path.join(ROOT, 'Rista Data.xlsx') },
  {
    label: 'Form Responses (pending)',
    path: path.join(ROOT, 'Rishta Data Form Responses (Dont Touch _ Edit).xlsx'),
  },
]

function norm(s: unknown): string {
  if (s == null) return ''
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ')
}

function normPhone(s: unknown): string {
  const digits = norm(s).replace(/[^\d]/g, '')
  if (digits.length < 10) return digits
  return digits.slice(-10)
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
    const [d, m, y] = parts
    if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }
  if (str.includes('T')) return str.slice(0, 10)
  return str
}

interface Fingerprint {
  line: number
  name: string
  nameNorm: string
  dob: string | null
  phone: string
  id: string
  father: string
  fatherNorm: string
  city: string
  gender: string
  row: unknown[]
}

function pick(row: unknown[], headers: string[], ...names: string[]): string {
  for (const n of names) {
    const idx = headers.findIndex((h) => h.trim() === n)
    if (idx >= 0 && row[idx] != null && String(row[idx]).trim()) return String(row[idx]).trim()
  }
  return ''
}

function fingerprint(line: number, headers: string[], row: unknown[]): Fingerprint {
  const dobRaw =
    pick(row, headers, 'Date of Birth') ||
    (() => {
      const idx = headers.findIndex((h) => /birth/i.test(h))
      return idx >= 0 ? String(row[idx] ?? '') : ''
    })()
  return {
    line,
    name: pick(row, headers, 'Name of Boy/Girl'),
    nameNorm: norm(pick(row, headers, 'Name of Boy/Girl')),
    dob: parseDate(dobRaw),
    phone: normPhone(
      pick(
        row,
        headers,
        "Parent's Contact Number [Preferably WhatsApp]",
        "Parents' Contact Number (Preferably Whatsapp)",
        'Parent Contact',
      ),
    ),
    id: pick(row, headers, 'ID No.', 'ID', 'Profile ID'),
    father: pick(row, headers, "Father's Name"),
    fatherNorm: norm(pick(row, headers, "Father's Name")),
    city: pick(row, headers, 'City / Village'),
    gender: pick(row, headers, 'Gender'),
    row,
  }
}

function loadWorkbook(filePath: string) {
  const wb = XLSX.readFile(filePath)
  return wb.SheetNames.map((sheetName) => {
    const data = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
      header: 1,
      defval: '',
    })
    const headers = (data[0] ?? []).map((h) => String(h ?? '').trim())
    const rows = data.slice(1).filter((r) => r.some((c) => String(c ?? '').trim()))
    const fps = rows.map((row, i) => fingerprint(i + 2, headers, row))
    return { sheetName, headers, rows, fps }
  })
}

type DupGroup = { key: string; items: Fingerprint[] }

function findDupes(fps: Fingerprint[], keyFn: (f: Fingerprint) => string): DupGroup[] {
  const map = new Map<string, Fingerprint[]>()
  for (const f of fps) {
    if (!f.nameNorm) continue
    const key = keyFn(f)
    if (!key) continue
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(f)
  }
  return [...map.entries()]
    .filter(([, items]) => items.length >= 2)
    .map(([key, items]) => ({ key, items }))
}

function analyzeSheet(label: string, sheetName: string, headers: string[], fps: Fingerprint[]) {
  const withName = fps.filter((f) => f.nameNorm)
  const emptyName = fps.length - withName.length

  const emptyCols = headers
    .map((h, i) => ({
      h,
      filled: fps.filter((f) => String(f.row[i] ?? '').trim()).length,
    }))
    .filter((c) => c.h && c.filled === 0)

  const dupExact = findDupes(withName, (f) =>
    [f.nameNorm, f.dob ?? '', f.phone, f.fatherNorm, norm(f.city)].join('|'),
  )
  const dupId = findDupes(withName, (f) => norm(f.id)).filter((g) => g.key)
  const dupNameDob = findDupes(withName, (f) => `${f.nameNorm}|${f.dob ?? ''}`)
  const dupNamePhone = findDupes(withName, (f) => (f.phone ? `${f.nameNorm}|${f.phone}` : '')).filter(
    (g) => g.key,
  )
  const dupNameFather = findDupes(withName, (f) => `${f.nameNorm}|${f.fatherNorm}`)

  return {
    label,
    sheetName,
    totalRows: fps.length,
    emptyName,
    headers,
    emptyCols,
    dupExact,
    dupId,
    dupNameDob,
    dupNamePhone,
    dupNameFather,
    fps: withName,
  }
}

function printGroups(title: string, groups: DupGroup[], fmt: (f: Fingerprint) => string, limit = 20) {
  console.log(`\n--- ${title}: ${groups.length} group(s) ---`)
  for (const g of groups.slice(0, limit)) {
    console.log(`  [${g.items.map((f) => `L${f.line} ${fmt(f)}`).join(' | ')}]`)
  }
  if (groups.length > limit) console.log(`  ... and ${groups.length - limit} more group(s)`)
}

const allSheets: ReturnType<typeof analyzeSheet>[] = []

for (const file of FILES) {
  if (!fs.existsSync(file.path)) {
    console.log(`\nMISSING: ${file.path}`)
    continue
  }
  console.log(`\n${'='.repeat(60)}\n${file.label}\n${'='.repeat(60)}`)
  const sheets = loadWorkbook(file.path)
  for (const s of sheets) {
    const report = analyzeSheet(file.label, s.sheetName, s.headers, s.fps)
    allSheets.push(report)
    console.log(`\nSheet: "${report.sheetName}"`)
    console.log(`Data rows: ${report.totalRows} (${report.emptyName} without name)`)
    console.log(`Columns (${report.headers.filter(Boolean).length}):`)
    console.log(`  ${report.headers.filter(Boolean).join('\n  ')}`)
    if (report.emptyCols.length) {
      console.log(`\nAlways-empty columns: ${report.emptyCols.map((c) => c.h).join(', ')}`)
    }

    printGroups(
      'Exact duplicate (name + DOB + phone + father + city)',
      report.dupExact,
      (f) => `id=${f.id || '-'} ${f.name}`,
    )
    printGroups('Duplicate ID No.', report.dupId, (f) => `${f.name} dob=${f.dob ?? '?'}`)
    printGroups(
      'Same name + DOB (likely same person)',
      report.dupNameDob,
      (f) => `id=${f.id || '-'} ph=${f.phone || 'none'}`,
      30,
    )
    printGroups(
      'Same name + phone',
      report.dupNamePhone,
      (f) => `dob=${f.dob ?? '?'}`,
      15,
    )

    const nameFatherConflict = report.dupNameFather.filter((g) => {
      const dobs = new Set(g.items.map((f) => f.dob))
      return dobs.size > 1
    })
    if (nameFatherConflict.length) {
      printGroups(
        'Same name + father but DIFFERENT DOB (review manually)',
        nameFatherConflict,
        (f) => `dob=${f.dob ?? '?'}`,
        10,
      )
    }
  }
}

// Cross-file
const main = allSheets.find((s) => s.label.includes('main'))
const form = allSheets.find((s) => s.label.includes('Form'))
if (main && form) {
  console.log(`\n${'='.repeat(60)}\nCROSS-FILE: Main vs Form Responses\n${'='.repeat(60)}`)
  const crossNameDob: { main: Fingerprint; form: Fingerprint }[] = []
  const crossPhone = new Map<string, { main: Fingerprint; form: Fingerprint }[]>()

  for (const a of main.fps) {
    for (const b of form.fps) {
      if (a.nameNorm === b.nameNorm && a.dob && b.dob && a.dob === b.dob) {
        crossNameDob.push({ main: a, form: b })
      }
      if (a.phone && b.phone && a.phone === b.phone) {
        if (!crossPhone.has(a.phone)) crossPhone.set(a.phone, [])
        crossPhone.get(a.phone)!.push({ main: a, form: b })
      }
    }
  }

  console.log(`\nSame name + DOB in BOTH files: ${crossNameDob.length} pair(s)`)
  for (const { main: a, form: b } of crossNameDob.slice(0, 30)) {
    console.log(
      `  Main L${a.line} (id ${a.id || '-'}) <-> Form L${b.line}: ${a.name} | ${a.dob} | ph ${a.phone || b.phone}`,
    )
  }
  if (crossNameDob.length > 30) console.log(`  ... and ${crossNameDob.length - 30} more`)

  console.log(`\nShared phone across files: ${crossPhone.size} number(s)`)
  for (const [ph, pairs] of [...crossPhone.entries()].slice(0, 15)) {
    const unique = [...new Map(pairs.map((p) => [`${p.main.line}-${p.form.line}`, p])).values()]
    console.log(
      `  ${ph}:`,
      unique.map((p) => `Main L${p.main.line} "${p.main.name}" <-> Form L${p.form.line} "${p.form.name}"`).join('; '),
    )
  }

  // Rows in form that are subset/duplicate of main
  const formOnlyDupes = crossNameDob.length
  const mainExtraFromDupes =
    (main?.dupNameDob.reduce((acc, g) => acc + g.items.length - 1, 0) ?? 0) +
    (main?.dupExact.reduce((acc, g) => acc + g.items.length - 1, 0) ?? 0)
  const formExtraFromDupes =
    (form?.dupNameDob.reduce((acc, g) => acc + g.items.length - 1, 0) ?? 0) +
    (form?.dupExact.reduce((acc, g) => acc + g.items.length - 1, 0) ?? 0)

  console.log(`\n${'='.repeat(60)}\nSUMMARY & RECOMMENDATIONS\n${'='.repeat(60)}`)
  console.log(`Main sheet rows: ${main.totalRows}`)
  console.log(`Form sheet rows: ${form.totalRows}`)
  console.log(`Duplicate rows to remove WITHIN main (name+DOB): ~${main.dupNameDob.reduce((a, g) => a + g.items.length - 1, 0)}`)
  console.log(`Duplicate rows to remove WITHIN form: ~${form.dupNameDob.reduce((a, g) => a + g.items.length - 1, 0)}`)
  console.log(`Form entries already in main (name+DOB match): ${formOnlyDupes} — skip on import`)
  console.log(`\nAfter cleanup, unique profiles estimate:`)
  console.log(
    `  Main: ~${main.totalRows - mainExtraFromDupes} | Form (new only): ~${form.totalRows - formExtraFromDupes - formOnlyDupes}`,
  )
}
