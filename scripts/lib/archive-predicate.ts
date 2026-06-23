/** SQL predicate for Excel-era rows to archive (never admin-handled, not today's pending). */
export const ARCHIVE_WHERE_SQL = `
  approved_by IS NULL
  AND NOT (status = 'pending' AND created_at::date >= CURRENT_DATE)
`.trim()

export const PRE_TODAY_WHERE_SQL = `created_at::date < CURRENT_DATE`.trim()

export const ARCHIVE_PREDICATE_DESCRIPTION =
  'approved_by IS NULL AND NOT (status = pending AND created_at >= today)'

export const LIVE_PROFILES_PREDICATE_DESCRIPTION =
  'created_at::date >= today (today submissions only)'
