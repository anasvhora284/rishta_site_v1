import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const records = JSON.parse(
  readFileSync(join(import.meta.dirname, 'profiles-import.json'), 'utf8'),
) as Record<string, unknown>[]

const OUT_DIR = join(import.meta.dirname, 'json-import-chunks')
const CHUNK = 100

mkdirSync(OUT_DIR, { recursive: true })

const sqlPrefix = `
INSERT INTO profiles (
  name, gender, qualification, qualification_other, current_profile,
  father_name, father_occupation, mother_name, city, city_other,
  date_of_birth, marital_status, height, weight_other, parent_contact,
  sub_cast, education_category, status, approved_at
)
SELECT
  r.name, r.gender, r.qualification, r.qualification_other, r.current_profile,
  r.father_name, r.father_occupation, r.mother_name, r.city, NULL::text,
  r.date_of_birth::date, r.marital_status, r.height, r.weight_other, r.parent_contact,
  r.sub_cast, r.education_category, 'approved', now()
FROM jsonb_to_recordset(
`

for (let i = 0; i < records.length; i += CHUNK) {
  const slice = records.slice(i, i + CHUNK)
  const json = JSON.stringify(slice).replace(/'/g, "''")
  const sql = `${sqlPrefix}'${json}'::jsonb) AS r(
  name text, gender text, qualification text, qualification_other text,
  current_profile text, father_name text, father_occupation text, mother_name text,
  city text, date_of_birth text, marital_status text, height text, weight_other text,
  parent_contact text, sub_cast text, education_category text
);`
  const file = join(OUT_DIR, `chunk-${String(Math.floor(i / CHUNK) + 1).padStart(2, '0')}.sql`)
  writeFileSync(file, sql)
  console.log('Wrote', file, slice.length, 'rows')
}
