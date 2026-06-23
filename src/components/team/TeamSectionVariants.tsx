import PhoneIcon from '@mui/icons-material/Phone'
import ITTeamIcon from '@/assets/ITteam.png'
import socialTeamIcon from '@/assets/socialTeam.png'
import teamWorkIcon from '@/assets/teamwork.png'
import RibbonCard from '@/components/RibbonCard'
import { TEAM_CONTACTS, type TeamContact } from '@/types/profile'
import {
  parseTeamMemberName,
  phoneTelHref,
  phoneWhatsAppHref,
} from '@/utils/teamContact'
import { useTranslation } from 'react-i18next'
import './TeamSectionVariants.css'

function TeamSectionHeader({
  title,
  iconSrc,
  iconClass,
  centered = false,
}: {
  title: string
  iconSrc: string
  iconClass: string
  centered?: boolean
}) {
  return (
    <div className={`team-variant__header${centered ? ' team-variant__header--center' : ''}`}>
      <span className="team-variant__header-pill">{title}</span>
      <img src={iconSrc} className={iconClass} alt="" />
    </div>
  )
}

function TeamMemberRowPlanA({ member }: { member: TeamContact }) {
  const { display, location } = parseTeamMemberName(member.name)
  const tel = phoneTelHref(member.phone)

  return (
    <div className="team-variant-a__row">
      <div className="team-variant-a__name-block">
        <span className="team-variant-a__name">{display}</span>
        {location && <span className="team-variant-a__location">{location}</span>}
      </div>
      {tel ? (
        <a className="team-variant-a__phone" href={tel}>
          {member.phone}
        </a>
      ) : (
        <span className="team-variant-a__phone team-variant-a__phone--empty">—</span>
      )}
    </div>
  )
}

function TeamMemberRowPlanC({
  member,
  centered = false,
}: {
  member: TeamContact
  centered?: boolean
}) {
  const { t } = useTranslation()
  const { display, location } = parseTeamMemberName(member.name)
  const tel = phoneTelHref(member.phone)
  const wa = phoneWhatsAppHref(member.phone)

  return (
    <div className={`team-variant-c__row${centered ? ' team-variant-c__row--center' : ''}`}>
      <div className="team-variant-c__info">
        <span className="team-variant-c__name">{display}</span>
        {location && <span className="team-variant-c__location">{location}</span>}
        {member.phone && <span className="team-variant-c__phone-text">{member.phone}</span>}
      </div>
      {(tel || wa) && (
        <div className="team-variant-c__actions">
          {tel && (
            <a className="team-variant-c__btn team-variant-c__btn--call" href={tel}>
              <PhoneIcon fontSize="inherit" />
              {t('team.call')}
            </a>
          )}
          {wa && (
            <a
              className="team-variant-c__btn team-variant-c__btn--wa"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('team.whatsapp')}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function ChiefBlockPlanA() {
  const { t } = useTranslation()
  const tel = phoneTelHref(TEAM_CONTACTS.chief.phone)

  return (
    <div className="team-variant-a__chief">
      <TeamSectionHeader title={t('team.chief')} iconSrc={teamWorkIcon} iconClass="team-variant__icon chief-img" />
      <p className="team-variant-a__chief-line">
        <span className="team-variant-a__name">{TEAM_CONTACTS.chief.name}</span>
        {tel ? (
          <a className="team-variant-a__phone" href={tel}>
            {TEAM_CONTACTS.chief.phone}
          </a>
        ) : null}
      </p>
    </div>
  )
}

function MemberListPlanA({ members }: { members: TeamContact[] }) {
  return (
    <div className="team-variant-a__list">
      {members.map((m) => (
        <TeamMemberRowPlanA key={m.name} member={m} />
      ))}
    </div>
  )
}

function PanelPlanB({
  title,
  iconSrc,
  iconClass,
  members,
}: {
  title: string
  iconSrc: string
  iconClass: string
  members: TeamContact[]
}) {
  return (
    <div className="team-variant-b__panel">
      <TeamSectionHeader title={title} iconSrc={iconSrc} iconClass={iconClass} />
      <MemberListPlanA members={members} />
    </div>
  )
}

/** Plan A — polished flat layout (same structure, on-brand typography + tel links) */
export function TeamSectionPlanA() {
  const { t } = useTranslation()

  return (
    <RibbonCard label={t('ribbon.team')} contentClassName="team-variant team-variant--a">
      <p className="team-variant__subtitle">{t('team.subtitle')}</p>
      <ChiefBlockPlanA />
      <div className="team-variant-a__grid">
        <div className="team-variant-a__column">
          <TeamSectionHeader
            title={t('team.social')}
            iconSrc={socialTeamIcon}
            iconClass="team-variant__icon social-team-img"
          />
          <MemberListPlanA members={TEAM_CONTACTS.social} />
        </div>
        <div className="team-variant-a__column">
          <TeamSectionHeader
            title={t('team.it')}
            iconSrc={ITTeamIcon}
            iconClass="team-variant__icon it-team-img"
          />
          <MemberListPlanA members={TEAM_CONTACTS.it} />
        </div>
      </div>
    </RibbonCard>
  )
}

/** Plan B — three inner mini-cards */
export function TeamSectionPlanB() {
  const { t } = useTranslation()

  return (
    <RibbonCard label={t('ribbon.team')} contentClassName="team-variant team-variant--b">
      <p className="team-variant__subtitle">{t('team.subtitle')}</p>
      <div className="team-variant-b__chief-panel team-variant-b__panel">
        <TeamSectionHeader title={t('team.chief')} iconSrc={teamWorkIcon} iconClass="team-variant__icon chief-img" />
        <MemberListPlanA members={[TEAM_CONTACTS.chief]} />
      </div>
      <div className="team-variant-b__grid">
        <PanelPlanB
          title={t('team.social')}
          iconSrc={socialTeamIcon}
          iconClass="team-variant__icon social-team-img"
          members={TEAM_CONTACTS.social}
        />
        <PanelPlanB
          title={t('team.it')}
          iconSrc={ITTeamIcon}
          iconClass="team-variant__icon it-team-img"
          members={TEAM_CONTACTS.it}
        />
      </div>
    </RibbonCard>
  )
}

/** Production — Plan A layout + Plan C actions; Chief name & phone centered */
export function TeamSectionCombined() {
  const { t } = useTranslation()

  return (
    <RibbonCard label={t('ribbon.team')} contentClassName="team-variant team-variant--combined">
      <p className="team-variant__subtitle">{t('team.subtitle')}</p>
      <div className="team-variant-a__chief">
        <TeamSectionHeader
          centered
          title={t('team.chief')}
          iconSrc={teamWorkIcon}
          iconClass="team-variant__icon chief-img"
        />
        <TeamMemberRowPlanC member={TEAM_CONTACTS.chief} centered />
      </div>
      <div className="team-variant-a__grid">
        <div className="team-variant-a__column">
          <TeamSectionHeader
            title={t('team.social')}
            iconSrc={socialTeamIcon}
            iconClass="team-variant__icon social-team-img"
          />
          <div className="team-variant-c__list">
            {TEAM_CONTACTS.social.map((m) => (
              <TeamMemberRowPlanC key={m.name} member={m} />
            ))}
          </div>
        </div>
        <div className="team-variant-a__column">
          <TeamSectionHeader
            title={t('team.it')}
            iconSrc={ITTeamIcon}
            iconClass="team-variant__icon it-team-img"
          />
          <div className="team-variant-c__list">
            {TEAM_CONTACTS.it.map((m) => (
              <TeamMemberRowPlanC key={m.name} member={m} />
            ))}
          </div>
        </div>
      </div>
    </RibbonCard>
  )
}

/** Plan C — mini-cards + Call / WhatsApp actions */
export function TeamSectionPlanC() {
  const { t } = useTranslation()

  return (
    <RibbonCard label={t('ribbon.team')} contentClassName="team-variant team-variant--c">
      <p className="team-variant__subtitle">{t('team.subtitle')}</p>
      <div className="team-variant-b__chief-panel team-variant-b__panel">
        <TeamSectionHeader title={t('team.chief')} iconSrc={teamWorkIcon} iconClass="team-variant__icon chief-img" />
        <div className="team-variant-c__list">
          <TeamMemberRowPlanC member={TEAM_CONTACTS.chief} />
        </div>
      </div>
      <div className="team-variant-b__grid">
        <div className="team-variant-b__panel">
          <TeamSectionHeader
            title={t('team.social')}
            iconSrc={socialTeamIcon}
            iconClass="team-variant__icon social-team-img"
          />
          <div className="team-variant-c__list">
            {TEAM_CONTACTS.social.map((m) => (
              <TeamMemberRowPlanC key={m.name} member={m} />
            ))}
          </div>
        </div>
        <div className="team-variant-b__panel">
          <TeamSectionHeader title={t('team.it')} iconSrc={ITTeamIcon} iconClass="team-variant__icon it-team-img" />
          <div className="team-variant-c__list">
            {TEAM_CONTACTS.it.map((m) => (
              <TeamMemberRowPlanC key={m.name} member={m} />
            ))}
          </div>
        </div>
      </div>
    </RibbonCard>
  )
}
