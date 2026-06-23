/**
 * Export full profiles + auth users to local JSON before archival.
 *
 * Usage: npm run export-db-backup
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { ARCHIVE_PREDICATE_DESCRIPTION } from './lib/archive-predicate.js'
import { fetchAllProfiles, fetchAuthUsers } from './lib/supabase-rest.js'

config()

const BACKUP_DATE = new Date().toISOString().slice(0, 10).replace(/-/g, '')

function isArchiveCandidate(row: {
  approved_by: string | null
  status: string
  created_at: string
}): boolean {
  if (row.approved_by != null) return false
  if (row.status === 'pending') {
    const createdDate = row.created_at.slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)
    if (createdDate >= today) return false
  }
  return true
}

async function main() {
  const outDir = path.join('scripts', 'output', 'backups', BACKUP_DATE)
  fs.mkdirSync(outDir, { recursive: true })

  console.log('Fetching all profiles…')
  const allProfiles = await fetchAllProfiles()
  const candidates = allProfiles.filter((p) =>
    isArchiveCandidate(p as { approved_by: string | null; status: string; created_at: string }),
  )

  console.log('Fetching auth users…')
  const authUsers = await fetchAuthUsers()

  const manifest = {
    exported_at: new Date().toISOString(),
    backup_date: BACKUP_DATE,
    archive_predicate: ARCHIVE_PREDICATE_DESCRIPTION,
    counts: {
      profiles_total: allProfiles.length,
      profiles_archive_candidates: candidates.length,
      auth_users: authUsers.length,
    },
  }

  fs.writeFileSync(path.join(outDir, 'profiles-full.json'), JSON.stringify(allProfiles, null, 2))
  fs.writeFileSync(
    path.join(outDir, 'profiles-archive-candidates.json'),
    JSON.stringify(candidates, null, 2),
  )
  fs.writeFileSync(
    path.join(outDir, 'auth-users.json'),
    JSON.stringify(
      authUsers.map((u) => ({
        id: u.id,
        email: u.email,
        app_metadata: u.app_metadata,
        user_metadata: u.user_metadata,
        created_at: u.created_at,
        updated_at: u.updated_at,
      })),
      null,
      2,
    ),
  )
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  console.log(`Backup written to ${outDir}`)
  console.log(JSON.stringify(manifest.counts, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
