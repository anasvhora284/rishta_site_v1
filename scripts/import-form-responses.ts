/**
 * Import form responses below the main-sheet sync marker into Supabase.
 * - Dedupes within the batch (keeps latest row per name + DOB)
 * - Matches existing DB rows by name+DOB or name+phone → updates fields
 * - Inserts unmatched rows as pending
 *
 * Usage:
 *   npx tsx scripts/import-form-responses.ts --dry-run
 *   npx tsx scripts/import-form-responses.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import {
  dedupeFormEntries,
  loadNewFormRows,
  norm,
  normPhone,
  toDbRecord,
} from './excel-sync-utils'

config()

interface DbProfile {
  id: string
  name: string
  date_of_birth: string
  parent_contact: string
  status: string
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const { marker, entries: rawEntries } = loadNewFormRows()
  const entries = dedupeFormEntries(rawEntries)

  console.log(`Sync marker: ${marker.method} (index ${marker.index})`)
  console.log(`Raw rows below marker: ${rawEntries.length}`)
  console.log(`After batch dedupe: ${entries.length}`)

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!dryRun && (!supabaseUrl || !serviceRoleKey)) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or use --dry-run).')
    process.exit(1)
  }

  let dbProfiles: DbProfile[] = []
  if (!dryRun) {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, date_of_birth, parent_contact, status')
    if (error) {
      console.error('Failed to load profiles:', error.message)
      process.exit(1)
    }
    dbProfiles = data ?? []
  }

  const byNameDob = new Map<string, DbProfile>()
  const byNamePhone = new Map<string, DbProfile>()
  for (const p of dbProfiles) {
    byNameDob.set(`${norm(p.name)}|${p.date_of_birth}`, p)
    const ph = normPhone(p.parent_contact)
    if (ph) byNamePhone.set(`${norm(p.name)}|${ph}`, p)
  }

  let inserted = 0
  let updated = 0
  let failed = 0

  const supabase = dryRun
    ? null
    : createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  for (const entry of entries) {
    const { parsed, fingerprint, line } = entry
    const nameNorm = fingerprint.nameNorm
    const dob = parsed.date_of_birth
    const phone = normPhone(parsed.parent_contact)

    const existing =
      byNameDob.get(`${nameNorm}|${dob}`) ??
      (phone ? byNamePhone.get(`${nameNorm}|${phone}`) : undefined)

    const record = toDbRecord(parsed, existing?.status === 'approved' ? 'approved' : 'pending')

    if (existing) {
      if (dryRun) {
        console.log(`[update] L${line} ${parsed.name} → existing ${existing.id.slice(0, 8)}… (${existing.status})`)
        updated++
        continue
      }

      const { error } = await supabase!
        .from('profiles')
        .update(record)
        .eq('id', existing.id)
      if (error) {
        console.error(`[fail update] L${line} ${parsed.name}:`, error.message)
        failed++
      } else {
        console.log(`Updated: ${parsed.name} (${existing.status})`)
        updated++
      }
    } else {
      if (dryRun) {
        console.log(`[insert] L${line} ${parsed.name} (${dob}) pending`)
        inserted++
        continue
      }

      const { data, error } = await supabase!.from('profiles').insert(record).select('id').single()
      if (error) {
        console.error(`[fail insert] L${line} ${parsed.name}:`, error.message)
        failed++
      } else {
        console.log(`Inserted pending: ${parsed.name}`)
        inserted++
        if (data) {
          byNameDob.set(`${nameNorm}|${dob}`, {
            id: data.id,
            name: parsed.name,
            date_of_birth: dob,
            parent_contact: parsed.parent_contact,
            status: 'pending',
          })
        }
      }
    }
  }

  const dupesRemoved = rawEntries.length - entries.length
  console.log('\n--- Summary ---')
  console.log(`Batch duplicates removed: ${dupesRemoved}`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Updated:  ${updated}`)
  console.log(`Failed:   ${failed}`)
  if (dryRun) console.log('\n(dry run — no database changes)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
