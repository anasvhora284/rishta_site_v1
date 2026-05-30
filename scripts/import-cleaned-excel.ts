/**
 * Import cleaned main Excel into Supabase (service role required).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/import-cleaned-excel.ts
 *   npx tsx scripts/import-cleaned-excel.ts --sql-only   # writes scripts/migrate-batches/*.sql
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

config()
import {
  loadMainSheetRows,
  parseMainSheetRow,
  type ParsedProfileRow,
} from './excel-row-utils'

const ROOT = path.resolve(import.meta.dirname, '../..')
const INPUT = path.join(ROOT, 'Rista Data - Cleaned.xlsx')
const BATCH_DIR = path.resolve(import.meta.dirname, 'migrate-batches')
const BATCH_SIZE = 40

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''")
}

function rowToSqlValues(r: ParsedProfileRow): string {
  const qOther = r.qualification_other ? `'${sqlEscape(r.qualification_other)}'` : 'NULL'
  const edu = sqlEscape(r.education_category || r.qualification)
  return `('${sqlEscape(r.name)}', '${r.gender}', '${sqlEscape(r.qualification)}', ${qOther}, '${sqlEscape(r.current_profile)}', '${sqlEscape(r.father_name)}', '${sqlEscape(r.father_occupation)}', '${sqlEscape(r.mother_name)}', '${sqlEscape(r.city)}', NULL, '${r.date_of_birth}', '${r.marital_status}', '${sqlEscape(r.height)}', '${sqlEscape(r.weight_other)}', '${sqlEscape(r.parent_contact)}', '${sqlEscape(r.sub_cast)}', '${edu}', 'approved', now())`
}

function toInsertSql(rows: ParsedProfileRow[]): string {
  const cols = `name, gender, qualification, qualification_other, current_profile, father_name, father_occupation, mother_name, city, city_other, date_of_birth, marital_status, height, weight_other, parent_contact, sub_cast, education_category, status, approved_at`
  const values = rows.map(rowToSqlValues).join(',\n')
  return `INSERT INTO profiles (${cols}) VALUES\n${values};`
}

function toRecord(r: ParsedProfileRow) {
  return {
    name: r.name,
    gender: r.gender,
    qualification: r.qualification,
    qualification_other: r.qualification_other,
    current_profile: r.current_profile,
    father_name: r.father_name,
    father_occupation: r.father_occupation,
    mother_name: r.mother_name,
    city: r.city,
    city_other: null,
    date_of_birth: r.date_of_birth,
    marital_status: r.marital_status,
    height: r.height,
    weight_other: r.weight_other,
    parent_contact: r.parent_contact,
    sub_cast: r.sub_cast,
    education_category: r.education_category,
    status: 'approved' as const,
    approved_at: new Date().toISOString(),
  }
}

async function main() {
  const sqlOnly = process.argv.includes('--sql-only')

  if (!fs.existsSync(INPUT)) {
    console.error('Missing:', INPUT)
    process.exit(1)
  }

  const parsed: ParsedProfileRow[] = []
  for (const row of loadMainSheetRows(INPUT)) {
    const p = parseMainSheetRow(row)
    if (p) parsed.push(p)
  }

  console.log(`Parsed ${parsed.length} profiles from ${path.basename(INPUT)}`)

  if (sqlOnly) {
    fs.mkdirSync(BATCH_DIR, { recursive: true })
    for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
      const chunk = parsed.slice(i, i + BATCH_SIZE)
      const file = path.join(BATCH_DIR, `batch-${String(Math.floor(i / BATCH_SIZE) + 1).padStart(3, '0')}.sql`)
      fs.writeFileSync(file, toInsertSql(chunk))
    }
    console.log(`Wrote ${Math.ceil(parsed.length / BATCH_SIZE)} SQL files to ${BATCH_DIR}`)
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or run with --sql-only).')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  let imported = 0
  let failed = 0

  for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
    const chunk = parsed.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('profiles').insert(chunk.map(toRecord))
    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message)
      failed += chunk.length
    } else {
      imported += chunk.length
      console.log(`Imported ${imported}/${parsed.length}`)
    }
  }

  console.log(`Done. Imported: ${imported}, failed: ${failed}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
