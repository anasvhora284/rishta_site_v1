/**
 * Verify profile archival counts after migration.
 *
 * Usage: npm run verify-archive
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { config } from 'dotenv'
import { countTable, fetchAllProfiles } from './lib/supabase-rest.js'

config()

function isToday(iso: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return iso.slice(0, 10) >= today
}

async function main() {
  let archivedTotal = 0
  try {
    archivedTotal = await countTable('profiles_archive')
  } catch {
    archivedTotal = 0
  }

  const all = await fetchAllProfiles()
  const today = new Date().toISOString().slice(0, 10)
  const preTodayRemaining = all.filter((p) => String(p.created_at).slice(0, 10) < today).length
  const todayRows = all.filter((p) => isToday(String(p.created_at)))
  const pending = all.filter((p) => p.status === 'pending').length

  const report = {
    live_total: all.length,
    archived_total: archivedTotal,
    pre_today_remaining: preTodayRemaining,
    today_submissions: todayRows.length,
    pending,
    today_date: today,
  }

  console.log('Archive verification report:')
  console.log(JSON.stringify(report, null, 2))

  const failures: string[] = []
  if (preTodayRemaining !== 0) {
    failures.push(`Expected 0 pre-today rows in live table, got ${preTodayRemaining}`)
  }
  if (archivedTotal === 0) {
    failures.push('profiles_archive is empty — archival may not have run')
  }
  if (all.length === 0) {
    failures.push('Live profiles table is empty')
  }
  if (todayRows.length === 0) {
    failures.push('No today submissions in live table')
  }

  if (failures.length) {
    console.error('\nFAILED:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }

  console.log('\nOK — live table contains today submissions only.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
