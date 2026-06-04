/**
 * Apply approved city cleanup to Supabase profiles.
 *
 * - Applies high-confidence normalization (casing, typos, address extraction)
 * - Skips medium/low-confidence rows (Anghadi, Bandhni, Malvan, Navakhal)
 * - Skips blank "Other" rows and anything that would map to Other
 *
 * Usage:
 *   npm run apply-city-cleanup -- --dry-run
 *   npm run apply-city-cleanup
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import {
  normalizeCityValue,
  shouldApplyCityCleanup,
} from './lib/city-normalize'

config()

interface ProfileRow {
  id: string
  name: string
  city: string
  city_other: string | null
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, city, city_other')

  if (error) {
    console.error('Failed to load profiles:', error.message)
    process.exit(1)
  }

  const rows = (data ?? []) as ProfileRow[]
  let updated = 0
  let skipped = 0
  let failed = 0
  let unchanged = 0

  const skippedSamples: string[] = []

  for (const row of rows) {
    const input = row.city === 'Other' && row.city_other ? row.city_other : row.city
    const normalized = normalizeCityValue(input)

    if (!shouldApplyCityCleanup(row.city, row.city_other, normalized)) {
      if (
        normalized.city === row.city &&
        (normalized.cityOther ?? null) === (row.city_other ?? null)
      ) {
        unchanged++
      } else {
        skipped++
        if (skippedSamples.length < 20) {
          skippedSamples.push(`  skip: "${row.city}" (${row.name})`)
        }
      }
      continue
    }

    const cityOther =
      normalized.method === 'contains' ? normalized.cityOther : undefined

    if (dryRun) {
      console.log(
        `[update] ${row.name}: "${row.city}" → "${normalized.city}"${cityOther ? ` (note kept)` : ''}`,
      )
      updated++
      continue
    }

    const payload: { city: string; city_other?: string | null } = { city: normalized.city }
    if (cityOther !== undefined) payload.city_other = cityOther

    const { error: updateError } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', row.id)

    if (updateError) {
      console.error(`[fail] ${row.name}:`, updateError.message)
      failed++
    } else {
      updated++
    }
  }

  console.log('\n--- Summary ---')
  console.log(`Total:     ${rows.length}`)
  console.log(`Updated:   ${updated}`)
  console.log(`Unchanged: ${unchanged}`)
  console.log(`Skipped:   ${skipped} (low-confidence / Other / unknown)`)
  console.log(`Failed:    ${failed}`)
  if (skippedSamples.length) {
    console.log('\nSkipped samples:')
    skippedSamples.forEach((s) => console.log(s))
  }
  if (dryRun) console.log('\n(dry run — no database changes)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
