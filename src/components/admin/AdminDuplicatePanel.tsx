import type { Profile } from '@/types/profile'
import { displayCity } from '@/utils'
import type { DuplicateAssessment } from '@/utils/profileDuplicate'
import { hasDuplicateMatches, isMergeTarget, profileFieldDiff } from '@/utils/profileDuplicate'
import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { DuplicateBadge } from './DuplicateBadge'

interface AdminDuplicatePanelProps {
  candidate: Profile
  assessment: DuplicateAssessment
  selectedMatchId: string | null
  onSelectMatch: (id: string) => void
  layout?: 'drawer' | 'page'
}

export default function AdminDuplicatePanel({
  candidate,
  assessment,
  selectedMatchId,
  onSelectMatch,
  layout = 'page',
}: AdminDuplicatePanelProps) {
  const { t } = useTranslation()

  if (!hasDuplicateMatches(assessment)) return null

  const isCompact = layout === 'drawer'

  const mergeEligibleCount = assessment.matches.filter((m) => isMergeTarget(m.profile)).length

  const selected =
    assessment.matches.find((m) => m.profile.id === selectedMatchId) ?? assessment.matches[0]

  const diffs = selected ? profileFieldDiff(selected.profile, candidate) : []

  return (
    <details className={`admin-dup-accordion admin-dup-accordion--${layout}`} open>
      <summary className="admin-dup-accordion__summary">
        <span className="admin-dup-accordion__title">{t('admin.section.duplicates')}</span>
        <DuplicateBadge level={assessment.level} />
      </summary>

      <div className="admin-dup-accordion__body">
        <Typography variant="caption" className="admin-dup-accordion__subtitle">
          {t('admin.duplicate.matchesTitle')}
        </Typography>

        <div className={`admin-dup-matches${isCompact ? ' admin-dup-matches--scroll' : ''}`}>
          {assessment.matches.map((match) => (
            <button
              key={match.profile.id}
              type="button"
              className={`admin-dup-match${selected?.profile.id === match.profile.id ? ' admin-dup-match--active' : ''}${!isMergeTarget(match.profile) ? ' admin-dup-match--readonly' : ''}`}
              onClick={() => onSelectMatch(match.profile.id)}
            >
              <span className="admin-dup-match__name">
                {match.profile.name}
                {match.profile.profile_id != null ? ` · ID ${match.profile.profile_id}` : ''}
                <span className={`admin-dup-match__status admin-dup-match__status--${match.profile.status}`}>
                  {t(`admin.${match.profile.status}`)}
                </span>
              </span>
              <span className="admin-dup-match__meta">
                {displayCity(match.profile)} · {match.reasons[0]}
              </span>
            </button>
          ))}
        </div>

        {selected && !isMergeTarget(selected.profile) && mergeEligibleCount > 0 && (
          <Typography variant="body2" className="admin-dup-accordion__hint">
            {t('admin.duplicate.selectApprovedToMerge')}
          </Typography>
        )}

        {selected && diffs.length > 0 && (
          <div className="admin-dup-diff-block">
            <Typography variant="caption" className="admin-dup-accordion__subtitle">
              {t('admin.duplicate.diffTitle')}
            </Typography>
            <div className="admin-dup-diff">
              {diffs.map((d) => (
                <div key={d.field} className="admin-dup-diff__row">
                  <span className="admin-dup-diff__field">{d.field}</span>
                  <div className="admin-dup-diff__change">
                    <div className="admin-dup-diff__value admin-dup-diff__value--before">
                      <span className="admin-dup-diff__label">{t('admin.duplicate.before')}</span>
                      <span className="admin-dup-diff__text">{d.before || '—'}</span>
                    </div>
                    <span className="admin-dup-diff__arrow" aria-hidden="true">
                      →
                    </span>
                    <div className="admin-dup-diff__value admin-dup-diff__value--after">
                      <span className="admin-dup-diff__label">{t('admin.duplicate.after')}</span>
                      <span className="admin-dup-diff__text">{d.after || '—'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selected && diffs.length === 0 && (
          <Typography variant="body2" className="admin-dup-accordion__hint">
            {t('admin.duplicate.noDiff')}
          </Typography>
        )}
      </div>
    </details>
  )
}
