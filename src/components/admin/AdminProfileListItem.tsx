import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import femaleAvatar from '@/assets/FemaleIcon.jpg'
import maleAvatar from '@/assets/MaleIcon.jpeg'
import { DuplicateBadge } from '@/components/admin/DuplicateBadge'
import { formatAdminDate } from '@/components/admin/adminTypes'
import type { Profile } from '@/types/profile'
import { displayCity } from '@/utils'
import { hasDuplicateMatches, type DuplicateAssessment } from '@/utils/profileDuplicate'
import { useTranslation } from 'react-i18next'

interface AdminProfileListItemProps {
  profile: Profile
  duplicate?: DuplicateAssessment
  selected?: boolean
  layout: 'desktop' | 'mobile'
  onSelect: (profile: Profile) => void
}

export default function AdminProfileListItem({
  profile,
  duplicate,
  selected,
  layout,
  onSelect,
}: AdminProfileListItemProps) {
  const { t } = useTranslation()
  const isMale = profile.gender === 'male'

  return (
    <button
      type="button"
      className={`admin-profile-item admin-profile-item--${layout}${selected ? ' admin-profile-item--selected' : ''}${isMale ? ' admin-profile-item--male' : ' admin-profile-item--female'}`}
      onClick={() => onSelect(profile)}
    >
      <div className={`admin-profile-item__avatar ${isMale ? 'male' : 'female'}`}>
        <img src={isMale ? maleAvatar : femaleAvatar} alt="" />
      </div>

      <div className="admin-profile-item__body">
        <div className="admin-profile-item__row1">
          <span className="admin-profile-item__name">{profile.name}</span>
          {profile.profile_id != null && (
            <span className="admin-profile-item__id">ID {profile.profile_id}</span>
          )}
          {profile.status === 'pending' && hasDuplicateMatches(duplicate) && duplicate && (
            <DuplicateBadge level={duplicate.level} />
          )}
        </div>
        <div className="admin-profile-item__row2">
          <span>{displayCity(profile)}</span>
          <span className="admin-profile-item__dot">·</span>
          <span>{profile.qualification}</span>
          {layout === 'desktop' && (
            <>
              <span className="admin-profile-item__dot">·</span>
              <span>{profile.parent_contact}</span>
            </>
          )}
        </div>
        <div className="admin-profile-item__row3">
          <span className={`admin-profile-item__status admin-profile-item__status--${profile.status}`}>
            {t(`admin.status.${profile.status}`)}
          </span>
          <span className="admin-profile-item__date">{formatAdminDate(profile.created_at)}</span>
        </div>
      </div>

      <ChevronRightIcon className="admin-profile-item__chevron" fontSize="small" />
    </button>
  )
}
