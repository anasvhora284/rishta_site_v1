/**
 * Push authoritative city list from canonical-cities.ts to Supabase.
 * Usage: npx tsx scripts/sync-authoritative-cities.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import {
  CANONICAL_CITIES,
  CITY_ALIASES_TO_CODE,
} from '../src/data/canonical-cities'

config()

const PROFILE_CITY_MIGRATIONS: Record<string, string> = {
  ...CITY_ALIASES_TO_CODE,
}

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const cityRows = CANONICAL_CITIES.map((c, i) => ({
    name: c.code,
    name_en: c.nameEn,
    name_gu: c.nameGu,
    sort_order: i + 1,
  }))

  const { error: deleteError } = await supabase.from('cities').delete().neq('name', '')
  if (deleteError) {
    console.error('Failed clearing cities:', deleteError.message)
    process.exit(1)
  }

  const { error: insertError } = await supabase.from('cities').insert(cityRows)
  if (insertError) {
    console.error('Failed inserting cities:', insertError.message)
    process.exit(1)
  }
  console.log(`Cities: inserted ${cityRows.length} rows`)

  for (const [from, to] of Object.entries(PROFILE_CITY_MIGRATIONS)) {
    const { error } = await supabase.from('profiles').update({ city: to }).eq('city', from)
    if (error) console.warn(`Profile city ${from} -> ${to}:`, error.message)
  }
  console.log('Profiles: legacy city codes migrated')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
