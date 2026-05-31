/**
 * Assign profile_id to approved rows that are missing one (e.g. Excel import).
 *
 * Usage: npm run backfill-profile-ids
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config()

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const { data: maxRow } = await supabase
    .from('profiles')
    .select('profile_id')
    .not('profile_id', 'is', null)
    .order('profile_id', { ascending: false })
    .limit(1)

  let nextId = (maxRow?.[0]?.profile_id as number | undefined) ?? 0

  const { data: missing, error } = await supabase
    .from('profiles')
    .select('id, name, created_at')
    .eq('status', 'approved')
    .is('profile_id', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  if (!missing?.length) {
    console.log('No approved profiles without profile_id.')
    return
  }

  console.log(`Assigning IDs ${nextId + 1} … ${nextId + missing.length} to ${missing.length} profiles`)

  for (const row of missing) {
    nextId += 1
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_id: nextId })
      .eq('id', row.id)

    if (updateError) {
      console.error(`Failed ${row.name}:`, updateError.message)
      process.exit(1)
    }
  }

  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
