import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import samajLogo from '@/assets/SplashScreenLogo.png'
import rishtaLogo from '@/assets/samajRishta.png'
import LanguageSwitcher from './LanguageSwitcher'
import '@/styles/navbar.css'

interface SiteNavbarProps {
  showBack?: boolean
  onBack?: () => void
}

export default function SiteNavbar({ showBack, onBack }: SiteNavbarProps) {
  const { t } = useTranslation()

  return (
    <header className="navbar-container">
      <div className="navbar-wrapper">
        <div className="navbar-top-bar">
          <div className="navbar-top-bar__start">
            {showBack && onBack ? (
              <button type="button" className="nav-back-btn" onClick={onBack}>
                <span className="nav-back-btn__arrow" aria-hidden>
                  ←
                </span>
                <span className="nav-back-btn__label">{t('nav.back')}</span>
              </button>
            ) : null}
          </div>
          <div className="navbar-top-bar__end nav-lang-switcher">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="navbar-inner-wrapper">
          <div className="samaj-logo-bg">
            <img src={samajLogo} className="samaj-logo" alt="" />
          </div>
          <Box className="nav-title-text">
            <Typography className="nav-title-main-text" component="p">
              {t('nav.title')}
            </Typography>
            <Typography className="nav-title-sub-text" component="p">
              {t('nav.subtitle')}
            </Typography>
          </Box>
          <div className="rishta-group-logo">
            <img src={rishtaLogo} className="rishta-group" alt="" />
          </div>
        </div>
      </div>
    </header>
  )
}
