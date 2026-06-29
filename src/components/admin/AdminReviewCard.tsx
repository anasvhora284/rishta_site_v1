import ProfileCard from '@/components/ProfileCard'
import { formatAdminDate, formatProfileActedBy } from '@/components/admin/adminTypes'
import { useAdminNameMap } from '@/hooks/useAdminUsers'
import { isHiddenFromBrowseProfile } from '@/hooks/useProfiles'
import type { Profile } from '@/types/profile'
import { useTranslation } from 'react-i18next'

interface AdminReviewCardProps {
  profile: Profile
  layout: 'drawer' | 'page'
}

export default function AdminReviewCard({ profile, layout }: AdminReviewCardProps) {
  const { t } = useTranslation()
  const { nameById } = useAdminNameMap()
  const hidden = isHiddenFromBrowseProfile(profile)
  const actedBy = formatProfileActedBy(profile, nameById, t)

  return (
    <div className={`admin-review-card admin-review-card--${layout}`}>
      <div className="admin-review-card__strip">
        <span className={`admin-review-card__status admin-review-card__status--${profile.status}`}>
          {t(`admin.status.${profile.status}`)}
        </span>
        <span className="admin-review-card__submitted">
          {t('admin.col.submitted')} · {formatAdminDate(profile.created_at)}
        </span>
        {actedBy && <span className="admin-review-card__acted-by">{actedBy}</span>}
        {profile.status === 'approved' && profile.approved_at && (
          <span className="admin-review-card__approved-at">
            {t('admin.approvedAt', { date: formatAdminDate(profile.approved_at) })}
          </span>
        )}
        {hidden && profile.profile_id != null && (
          <span className="admin-review-card__listed">
            {t('admin.hiddenWasListed', { id: profile.profile_id })}
          </span>
        )}
        {hidden && profile.profile_id == null && (
          <span className="admin-review-card__listed">{t('admin.hiddenNeverListed')}</span>
        )}
        {hidden && (
          <span className="admin-review-card__hidden">{t('admin.hiddenFromBrowse')}</span>
        )}
      </div>

      <ProfileCard profile={profile} />

      {profile.admin_notes?.trim() && (
        <div className="admin-review-card__notes">
          <span className="admin-review-card__notes-label">{t('admin.notes')}</span>
          <p className="admin-review-card__notes-text">{profile.admin_notes}</p>
        </div>
      )}
    </div>
  )
}
