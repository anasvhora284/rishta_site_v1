/**
 * Dry-run Excel profile archival counts.
 *
 * Usage: npm run archive-excel-profiles
 */

import { config } from 'dotenv'
import { ARCHIVE_PREDICATE_DESCRIPTION } from './lib/archive-predicate.js'
import { fetchAllProfiles } from './lib/supabase-rest.js'

config()

async function main() {
  const all = await fetchAllProfiles()
  const today = new Date().toISOString().slice(0, 10)

  const toArchive = all.filter((row) => {
    if (row.approved_by != null) return false
    if (row.status === 'pending' && String(row.created_at).slice(0, 10) >= today) return false
    return true
  })

  console.log('Archive predicate:', ARCHIVE_PREDICATE_DESCRIPTION)
  console.log({
    total: all.length,
    to_archive: toArchive.length,
    to_keep: all.length - toArchive.length,
    mode: 'dry-run',
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
