# Scripts

One-off migration and data-maintenance utilities. Not used at runtime by the portal.

## Common commands

| Script | Purpose |
|--------|---------|
| `npm run migrate` | Import from Excel |
| `npm run rebuild-reference-data` | Rebuild cities/qualifications reference |
| `npm run sync-city-gujarati` | Generate Gujarati city labels |

## Generated output

Artifacts under `scripts/output/`, `scripts/migrate-batches/`, and `scripts/json-import-chunks/` are gitignored. Regenerate as needed.

## Environment

Scripts that touch Supabase need `SUPABASE_SERVICE_ROLE_KEY` in `.env` (see `.env.example`).
