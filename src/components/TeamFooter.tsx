import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { TEAM_CONTACTS } from '@/types/profile'
import { toWhatsAppUrl } from '@/utils'
import './TeamFooter.css'

export default function TeamFooter() {
  const { t } = useTranslation()

  return (
    <div className="team-footer">
      <div className="team-section">
        <Typography className="team-heading">{t('team.chief')}</Typography>
        <a href={toWhatsAppUrl(TEAM_CONTACTS.chief.phone)} className="team-link">
          {TEAM_CONTACTS.chief.name} — {TEAM_CONTACTS.chief.phone}
        </a>
      </div>
      <Box className="team-columns">
        <div className="team-section">
          <Typography className="team-heading">{t('team.social')}</Typography>
          {TEAM_CONTACTS.social.map((c) => (
            <a key={c.phone} href={c.phone ? toWhatsAppUrl(c.phone) : '#'} className="team-link">
              {c.name}{c.phone ? ` — ${c.phone}` : ''}
            </a>
          ))}
        </div>
        <div className="team-section">
          <Typography className="team-heading">{t('team.it')}</Typography>
          {TEAM_CONTACTS.it.map((c) => (
            <a key={c.name} href={c.phone ? toWhatsAppUrl(c.phone) : '#'} className="team-link">
              {c.name}{c.phone ? ` — ${c.phone}` : ''}
            </a>
          ))}
        </div>
      </Box>
    </div>
  )
}
