#!/usr/bin/env node
/**
 * Apply json-import-chunks via Supabase service role.
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/apply-json-chunks.mjs
 */
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const dir = join(dirname(fileURLToPath(import.meta.url)), 'json-import-chunks')
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()

for (const file of files) {
  const sql = readFileSync(join(dir, file), 'utf8')
  const { error } = await supabase.rpc('exec_sql', { query: sql })
  if (error) {
    // fallback: use postgrest raw if rpc missing — use fetch to SQL endpoint
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    })
    if (!res.ok) {
      console.error(file, await res.text())
      process.exit(1)
    }
  }
  console.log('OK', file)
}
