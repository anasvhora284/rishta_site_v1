/**
 * One-time migration script: import Excel data into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run migrate -- \
 *     "../Rista Data.xlsx" \
 *     "../Rishta Data Form Responses (Dont Touch _ Edit).xlsx"
 *
 * The first file is treated as approved (main sheet).
 * The second file (optional) is treated as pending submissions.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as XLSX from 'xlsx'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

interface RowMap {
  profile_id?: number
  name?: string
  gender?: string
  current_profile?: string
  father_name?: string
  father_occupation?: string
  mother_name?: string
  city?: string
  date_of_birth?: string
  marital_status?: string
  height?: string
  weight_other?: string
  parent_contact?: string
  sub_cast?: string
  qualification?: string
  education_category?: string
}

function normalizeGender(value: string): 'male' | 'female' {
  return value.toLowerCase().includes('female') ? 'female' : 'male'
}

function normalizeMarital(value: string): 'unmarried' | 'divorce' | 'widowed' {
  const v = value.toLowerCase()
  if (v.includes('divorce')) return 'divorce'
  if (v.includes('widow')) return 'widowed'
  return 'unmarried'
}

function parseDate(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }
  const str = String(value).trim()
  if (!str) return null

  // Excel serial date
  if (/^\d+(\.\d+)?$/.test(str)) {
    const date = XLSX.SSF.parse_date_code(Number(str))
    if (date) {
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${date.y}-${pad(date.m)}-${pad(date.d)}`
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const parts = str.replace(/\//g, '-').split('-')
  if (parts.length === 3) {
    const [d, m, y] = parts
    if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }

  if (str.includes('T')) return str.slice(0, 10)
  return str
}

function mapApprovedRow(headers: string[], row: unknown[]): RowMap | null {
  const get = (header: string) => {
    const idx = headers.findIndex((h) => h.trim() === header)
    return idx >= 0 ? row[idx] : undefined
  }

  const name = String(get('Name of Boy/Girl') ?? '').trim()
  if (!name) return null

  const dob = parseDate(get('Date of Birth'))
  if (!dob) return null

  return {
    profile_id: Number(get('ID No.')) || undefined,
    name,
    gender: normalizeGender(String(get('Gender') ?? 'male')),
    current_profile: String(get("Boy's / Girl's Current Profile") ?? '').trim(),
    father_name: String(get("Father's Name") ?? '').trim(),
    father_occupation: String(get("Father's Occupation") ?? '').trim(),
    mother_name: String(get("Mother's Name") ?? '').trim(),
    city: String(get('City / Village') ?? '').trim(),
    date_of_birth: dob,
    marital_status: normalizeMarital(String(get('Marital Status') ?? 'unmarried')),
    height: String(get('Height') ?? '').trim(),
    weight_other: String(get('Weight/Other Information') ?? '').trim(),
    parent_contact: String(get("Parent's Contact Number [Preferably WhatsApp]") ?? get("Parents' Contact Number (Preferably Whatsapp)") ?? '').trim(),
    sub_cast: String(get('68 Sub Cast') ?? '').trim(),
    qualification: String(get('Qualification') ?? '').trim(),
    education_category: String(get('Education Category') ?? get('Qualification') ?? '').trim(),
  }
}

async function importSheet(filePath: string, status: 'approved' | 'pending') {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found, skipping: ${filePath}`)
    return 0
  }

  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
  const headers = (data[0] as string[]).map((h) => String(h ?? ''))
  const rows = data.slice(1) as unknown[][]

  let imported = 0
  for (const row of rows) {
    const mapped = mapApprovedRow(headers, row)
    if (!mapped || !mapped.name) continue

    const record = {
      profile_id: status === 'approved' ? mapped.profile_id ?? null : null,
      name: mapped.name,
      gender: mapped.gender,
      qualification: mapped.qualification || 'Other',
      qualification_other: mapped.qualification === 'Other' ? mapped.education_category : null,
      current_profile: mapped.current_profile || '-',
      father_name: mapped.father_name || '-',
      father_occupation: mapped.father_occupation || '-',
      mother_name: mapped.mother_name || '-',
      city: mapped.city || '',
      city_other: null,
      date_of_birth: mapped.date_of_birth,
      marital_status: mapped.marital_status,
      height: mapped.height || '-',
      weight_other: mapped.weight_other || '-',
      parent_contact: mapped.parent_contact || '-',
      sub_cast: mapped.sub_cast || '-',
      education_category: mapped.education_category || mapped.qualification,
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    }

    const { error } = await supabase.from('profiles').insert(record)
    if (error) {
      console.error(`Failed to import ${mapped.name}:`, error.message)
    } else {
      imported++
    }
  }

  console.log(`Imported ${imported} ${status} profiles from ${path.basename(filePath)}`)
  return imported
}

async function main() {
  const args = process.argv.slice(2)
  const approvedFile = args[0] ?? '../Rista Data.xlsx'
  const pendingFile = args[1] ?? '../Rishta Data Form Responses (Dont Touch _ Edit).xlsx'

  console.log('Starting migration...')
  const approved = await importSheet(path.resolve(approvedFile), 'approved')
  const pending = await importSheet(path.resolve(pendingFile), 'pending')
  console.log(`Done. Approved: ${approved}, Pending: ${pending}`)
}

main().catch(console.error)
