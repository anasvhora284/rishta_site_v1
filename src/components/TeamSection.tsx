import ITTeamIcon from '@/assets/ITteam.png'
import socialTeamIcon from '@/assets/socialTeam.png'
import teamWorkIcon from '@/assets/teamwork.png'
import RibbonCard from '@/components/RibbonCard'
import { TEAM_CONTACTS } from '@/types/profile'
import { useTranslation } from 'react-i18next'
import './TeamSection.css'

export default function TeamSection() {
  const { t } = useTranslation()

  return (
    <div className="our_team_wrapper container">
      <RibbonCard label={t('ribbon.team')} contentClassName="TeamHeading-container">
        <div className="chief-details">
          <div className="chief-wrapper">
            <h1>Chief</h1>
            <img src={teamWorkIcon} className="chief-img" alt="" />
          </div>
          <p>
            <span>{TEAM_CONTACTS.chief.name}</span>
            <span>{TEAM_CONTACTS.chief.phone}</span>
          </p>
        </div>
        <div className="TeamHeading">
          <div className="social_team">
            <div className="team-label-wrapper">
              <p className="team_label">Social Team</p>
              <img src={socialTeamIcon} className="social-team-img" alt="" />
            </div>
            <div className="team_details">
              {TEAM_CONTACTS.social.map((c) => (
                <p key={c.name}>
                  <span>{c.name}</span>
                  {c.phone ? <span> {c.phone}</span> : <span> </span>}
                </p>
              ))}
            </div>
          </div>
          <div className="IT_team">
            <div className="team-label-wrapper">
              <p className="team_label">IT Team</p>
              <img src={ITTeamIcon} className="it-team-img" alt="" />
            </div>
            <div className="team_details">
              {TEAM_CONTACTS.it.map((c) => (
                <p key={c.name}>
                  <span>{c.name}</span>
                  {c.phone ? <span> {c.phone}</span> : <span> </span>}
                </p>
              ))}
            </div>
          </div>
        </div>
      </RibbonCard>
    </div>
  )
}
