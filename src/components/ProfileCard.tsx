import CallIcon from '@mui/icons-material/Call'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import femaleAvatar from '@/assets/FemaleIcon.jpg'
import maleAvatar from '@/assets/MaleIcon.jpeg'
import type { Profile } from '@/types/profile'
import {
  calculateAge,
  capitalizeWords,
  displayCity,
  formatDisplayDate,
  toTelUrl,
  toWhatsAppUrl,
} from '@/utils'
import { useTranslation } from 'react-i18next'
import './ProfileCard.css'

interface ProfileCardProps {
  profile: Profile
  compact?: boolean
}

export default function ProfileCard({ profile, compact = false }: ProfileCardProps) {
  const { t } = useTranslation()
  const isMale = profile.gender === 'male'
  const cityDisplay = capitalizeWords(displayCity(profile))
  const age = calculateAge(profile.date_of_birth.replace(/-/g, '/'))
  const hasContact = Boolean(profile.parent_contact?.trim())
  const callUrl = hasContact ? toTelUrl(profile.parent_contact) : null
  const whatsappUrl = hasContact ? toWhatsAppUrl(profile.parent_contact) : null

  const highlights = [
    { label: t('listing.height'), value: profile.height },
    { label: t('listing.city'), value: cityDisplay },
    { label: t('listing.qualification'), value: profile.qualification?.toUpperCase() },
    { label: t('listing.maritalStatus'), value: t(`marital.${profile.marital_status}`) },
  ]

  const details = [
    { label: t('listing.education'), value: profile.education_category ?? profile.qualification },
    { label: t('listing.currentProfile'), value: profile.current_profile },
    { label: t('listing.weight'), value: profile.weight_other },
    { label: t('listing.fatherName'), value: profile.father_name },
    { label: t('listing.fatherOccupation'), value: profile.father_occupation },
    { label: t('listing.motherName'), value: profile.mother_name },
    { label: t('listing.subCast'), value: profile.sub_cast },
  ]

  return (
    <article className={`profile-card ${compact ? 'profile-card--compact' : ''}`}>
      {profile.profile_id != null && (
        <span className="profile-card__id">ID {profile.profile_id}</span>
      )}

      <header className="profile-card__header">
        <div className={`profile-card__avatar ${isMale ? 'male' : 'female'}`}>
          <img
            src={isMale ? maleAvatar : femaleAvatar}
            alt=""
            className="profile-card__avatar-img"
          />
        </div>
        <div className="profile-card__headline">
          <h2 className="profile-card__name" title={profile.name}>
            {profile.name}
          </h2>
          <p className="profile-card__meta">
            {formatDisplayDate(profile.date_of_birth)}
            {' · '}
            {t('listing.ageYears', { age })}
            {' · '}
            <span className={`gender-chip ${isMale ? 'male' : 'female'}`}>
              {isMale ? t('filter.male') : t('filter.female')}
            </span>
          </p>
        </div>
      </header>

      <div className="profile-card__chips">
        {highlights.map((item) => (
          <span key={item.label} className="profile-card__chip">
            <strong>{item.label}</strong> {item.value || '—'}
          </span>
        ))}
      </div>

      <dl className="profile-card__details">
        {details.map((item) => (
          <div key={item.label} className="profile-card__detail-row">
            <dt>{item.label}</dt>
            <dd title={item.value || undefined}>{item.value || '—'}</dd>
          </div>
        ))}
      </dl>

      {hasContact && (
        <div className="profile-card__contact-actions">
          <a href={callUrl!} className="profile-card__contact-btn profile-card__contact-btn--call">
            <CallIcon />
            {t('listing.contactCall')}
          </a>
          <a
            href={whatsappUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-card__contact-btn profile-card__contact-btn--whatsapp"
          >
            <WhatsAppIcon />
            {t('listing.contactWhatsApp')}
          </a>
        </div>
      )}
    </article>
  )
}
