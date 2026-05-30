#!/usr/bin/env node
/**
 * Apply migrate-batches/*.sql via Supabase Management API.
 * Requires: SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-sql-batches.mjs
 */
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_REF = 'rpozepqdwghwzinsrxfv'
const token = process.env.SUPABASE_ACCESS_TOKEN

if (!token) {
  console.error('Set SUPABASE_ACCESS_TOKEN (Supabase dashboard → Account → Access Tokens)')
  process.exit(1)
}

const dir = join(__dirname, 'migrate-batches')
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()

for (const file of files) {
  const sql = readFileSync(join(dir, file), 'utf8')
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const body = await res.text()
  if (!res.ok) {
    console.error('FAIL', file, res.status, body.slice(0, 500))
    process.exit(1)
  }
  console.log('OK', file)
}

console.log('All batches applied.')
