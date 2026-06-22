/**
 * Sync Gujarati city labels in canonical-cities.ts + scripts/output/city-gu-patch.sql
 * Usage: npx tsx scripts/sync-city-gujarati.ts
 */

import { writeFileSync, mkdirSync } from 'fs'
import { CANONICAL_CITIES } from '../src/data/canonical-cities'
import { toGujaratiPlaceName } from './lib/gujaratiPlaceName'

function needsGu(c: { nameEn: string; nameGu: string }) {
  return c.nameGu === c.nameEn || /^[A-Za-z0-9]/.test(c.nameGu)
}

const updated = CANONICAL_CITIES.map((c) => ({
  ...c,
  nameGu: needsGu(c) ? toGujaratiPlaceName(c.code, c.nameEn) : c.nameGu,
}))

const escStr = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const lines = [
  '/** Canonical city codes stored in profiles.city — DB seed + normalization source. */',
  'export interface CanonicalCity {',
  '  code: string',
  '  nameEn: string',
  '  nameGu: string',
  '}',
  '',
  'export const CANONICAL_CITIES: CanonicalCity[] = [',
  ...updated.map(
    (c) => `  { code: '${escStr(c.code)}', nameEn: '${escStr(c.nameEn)}', nameGu: '${escStr(c.nameGu)}' },`,
  ),
  ']',
  '',
  'export const CITY_ALIASES_TO_CODE: Record<string, string> = {',
  "  Ajarpura: 'AJARPURA',",
  "  Borsad: 'BORSAD',",
  "  Khambhat: 'KHAMBHAT',",
  "  Mahemdavad: 'MAHEMDAVAD',",
  "  'Kalsar (dakor)': 'DAKOR',",
  "  OD: 'ODE',",
  '}',
  '',
  'export const CANONICAL_CITY_CODES = new Set(CANONICAL_CITIES.map((c) => c.code))',
  '',
  'export const CANONICAL_CITY_BY_CODE = new Map(CANONICAL_CITIES.map((c) => [c.code, c]))',
  '',
]

writeFileSync('./src/data/canonical-cities.ts', lines.join('\n'))

const sqlEsc = (s: string) => s.replace(/'/g, "''")
const sql = updated
  .filter(needsGu)
  .map((c) => `UPDATE cities SET name_gu = '${sqlEsc(c.nameGu)}' WHERE name = '${sqlEsc(c.code)}';`)
  .join('\n')

mkdirSync('./scripts/output', { recursive: true })
writeFileSync('./scripts/output/city-gu-patch.sql', sql + '\n')
console.log(`Patched ${updated.filter(needsGu).length} city Gujarati labels`)
