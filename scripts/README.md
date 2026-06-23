# Scripts

Maintenance utilities for the portal. Not used at runtime.

## Active commands

| Script | npm command | Purpose |
|--------|-------------|---------|
| `export-db-backup.ts` | `npm run export-db-backup` | Local JSON backup of profiles + auth users |
| `verify-archive.ts` | `npm run verify-archive` | Post-archival count checks |
| `archive-excel-profiles.ts` | `npm run archive-excel-profiles` | Dry-run archive predicate counts |
| `rebuild-reference-data.ts` | `npm run rebuild-reference-data` | Rebuild cities/qualifications reference |
| `sync-city-gujarati.ts` | `npm run sync-city-gujarati` | Generate Gujarati city labels |

## Schema migrations

Database schema lives in `supabase/migrations/` — apply via Supabase CLI or dashboard, not via these scripts.

## Archived tooling

One-off Excel import and city cleanup scripts were removed after migration. See `scripts/archive/README.md` and `/home/ayaan/Work/RishtaSiteBackups/`.

## Generated output

`scripts/output/` is gitignored. Regenerate with the commands above as needed.

## Environment

Scripts that touch Supabase need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env` (see `.env.example`).
