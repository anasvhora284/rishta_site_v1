import { writeFileSync } from 'fs'
import { join } from 'path'
import { loadMainSheetRows, parseMainSheetRow } from './excel-row-utils'

const ROOT = join(import.meta.dirname, '../..')
const INPUT = join(ROOT, 'Rista Data - Cleaned.xlsx')
const OUT = join(import.meta.dirname, 'profiles-import.json')

const records = []
for (const row of loadMainSheetRows(INPUT)) {
  const p = parseMainSheetRow(row)
  if (!p) continue
  records.push({
    name: p.name,
    gender: p.gender,
    qualification: p.qualification,
    qualification_other: p.qualification_other,
    current_profile: p.current_profile,
    father_name: p.father_name,
    father_occupation: p.father_occupation,
    mother_name: p.mother_name,
    city: p.city,
    date_of_birth: p.date_of_birth,
    marital_status: p.marital_status,
    height: p.height,
    weight_other: p.weight_other,
    parent_contact: p.parent_contact,
    sub_cast: p.sub_cast,
    education_category: p.education_category || p.qualification,
  })
}

writeFileSync(OUT, JSON.stringify(records))
console.log('Wrote', records.length, 'records to', OUT)
