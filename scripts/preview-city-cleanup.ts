/**
 * READ-ONLY preview of city cleanup — does NOT update the database.
 *
 * Usage:
 *   npm run preview-city-cleanup
 *   npm run preview-city-cleanup -- --json
 *
 * Writes a markdown report to scripts/output/city-cleanup-preview.md
 */

import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { normalizeCityValue } from './lib/city-normalize'

config()

interface ProfileRow {
  id: string
  name: string
  city: string
  city_other: string | null
  status: string
}

interface ChangeGroup {
  from: string
  to: string
  method: string
  count: number
  examples: string[]
}

async function main() {
  const asJson = process.argv.includes('--json')
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (read-only query).')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, city, city_other, status')
    .order('city')

  if (error) {
    console.error('Failed to load profiles:', error.message)
    process.exit(1)
  }

  const rows = (data ?? []) as ProfileRow[]
  const changes: Array<{
    id: string
    name: string
    status: string
    beforeCity: string
    beforeCityOther: string | null
    afterCity: string
    afterCityOther: string | null
    method: string
  }> = []

  for (const row of rows) {
    const input = row.city === 'Other' && row.city_other ? row.city_other : row.city
    const normalized = normalizeCityValue(input)
    const afterCityOther =
      normalized.cityOther ??
      (row.city_other && normalized.city === row.city ? row.city_other : null)

    const wouldChange =
      normalized.city !== row.city ||
      (afterCityOther ?? null) !== (row.city_other ?? null)

    if (wouldChange) {
      changes.push({
        id: row.id,
        name: row.name,
        status: row.status,
        beforeCity: row.city,
        beforeCityOther: row.city_other,
        afterCity: normalized.city,
        afterCityOther: afterCityOther,
        method: normalized.method,
      })
    }
  }

  const groupMap = new Map<string, ChangeGroup>()
  for (const c of changes) {
    const key = `${c.beforeCity}\0${c.afterCity}\0${c.method}`
    const prev = groupMap.get(key)
    if (prev) {
      prev.count++
      if (prev.examples.length < 3) prev.examples.push(c.name)
    } else {
      groupMap.set(key, {
        from: c.beforeCity,
        to: c.afterCity,
        method: c.method,
        count: 1,
        examples: [c.name],
      })
    }
  }

  const groups = [...groupMap.values()].sort((a, b) => b.count - a.count)
  const distinctBefore = new Set(rows.map((r) => r.city)).size
  const distinctAfter = new Set(
    rows.map((r) => {
      const input = r.city === 'Other' && r.city_other ? r.city_other : r.city
      return normalizeCityValue(input).city
    }),
  ).size

  const byMethod = changes.reduce<Record<string, number>>((acc, c) => {
    acc[c.method] = (acc[c.method] ?? 0) + 1
    return acc
  }, {})

  const otherSamples = changes
    .filter((c) => c.afterCity === 'Other')
    .slice(0, 25)
    .map((c) => `- \`${c.beforeCity}\` → Other (${c.name})`)

  const lines: string[] = [
    '# City cleanup preview (DRY RUN — no DB changes)',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total profiles | ${rows.length} |`,
    `| Would change | ${changes.length} |`,
    `| Unchanged | ${rows.length - changes.length} |`,
    `| Distinct \`city\` values now | ${distinctBefore} |`,
    `| Distinct after normalization | ${distinctAfter} |`,
    '',
    '### By method',
    '',
    ...Object.entries(byMethod)
      .sort((a, b) => b[1] - a[1])
      .map(([method, count]) => `- **${method}**: ${count}`),
    '',
    '## Top changes (grouped)',
    '',
    '| Count | From | To | Method | Examples |',
    '|------:|------|----|--------|----------|',
    ...groups.slice(0, 60).map(
      (g) =>
        `| ${g.count} | ${g.from.replace(/\|/g, '\\|')} | ${g.to} | ${g.method} | ${g.examples.join('; ')} |`,
    ),
    '',
    '## Would stay as Other (sample — needs manual review or new canonical entry)',
    '',
    ...(otherSamples.length ? otherSamples : ['_(none)_']),
    '',
    '## Sample row-level changes (first 40)',
    '',
    '| Name | Before | After | Method |',
    '|------|--------|-------|--------|',
    ...changes.slice(0, 40).map(
      (c) =>
        `| ${c.name.replace(/\|/g, '\\|')} | \`${c.beforeCity}\` | \`${c.afterCity}\`${c.afterCityOther ? ` (+ note)` : ''} | ${c.method} |`,
    ),
    '',
    '---',
    '',
    '**This report is preview only.** Run a separate apply script only after you approve the mapping rules.',
  ]

  const outDir = path.resolve(import.meta.dirname, 'output')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'city-cleanup-preview.md')
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8')

  console.log('=== City cleanup PREVIEW (no database writes) ===\n')
  console.log(`Profiles: ${rows.length}`)
  console.log(`Would change: ${changes.length}`)
  console.log(`Unchanged: ${rows.length - changes.length}`)
  console.log(`Distinct cities now: ${distinctBefore} → after: ${distinctAfter}\n`)
  console.log('By method:', byMethod)
  console.log('\nTop 15 grouped changes:')
  for (const g of groups.slice(0, 15)) {
    console.log(`  [${g.count}x] "${g.from}" → ${g.to} (${g.method})`)
  }
  console.log(`\nFull report: ${outPath}`)

  if (asJson) {
    const jsonPath = path.join(outDir, 'city-cleanup-preview.json')
    fs.writeFileSync(
      jsonPath,
      JSON.stringify({ summary: { total: rows.length, changes: changes.length, distinctBefore, distinctAfter, byMethod }, groups, changes }, null, 2),
      'utf8',
    )
    console.log(`JSON export: ${jsonPath}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
