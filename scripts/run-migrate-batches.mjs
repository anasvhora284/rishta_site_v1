#!/usr/bin/env node
/**
 * Prints batch SQL paths for MCP / manual apply.
 * For automated apply with service role:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run import-excel
 */
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = join(dirname(fileURLToPath(import.meta.url)), 'migrate-batches')
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
console.log(JSON.stringify({ count: files.length, files: files.map((f) => join(dir, f)) }))
