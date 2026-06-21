import { Chip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { DuplicateLevel } from '@/utils/profileDuplicate'

export function DuplicateBadge({ level }: { level: DuplicateLevel }) {
  const { t } = useTranslation()

  if (level === 'new') {
    return <Chip size="small" label={t('admin.duplicate.new')} className="admin-dup-badge admin-dup-badge--new" />
  }
  if (level === 'exact') {
    return (
      <Chip size="small" label={t('admin.duplicate.exact')} className="admin-dup-badge admin-dup-badge--exact" />
    )
  }
  if (level === 'name_dob') {
    return (
      <Chip
        size="small"
        label={t('admin.duplicate.nameDob')}
        className="admin-dup-badge admin-dup-badge--match"
      />
    )
  }
  return (
    <Chip
      size="small"
      label={t('admin.duplicate.namePhone')}
      className="admin-dup-badge admin-dup-badge--match"
    />
  )
}
