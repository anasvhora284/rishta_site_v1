import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import './Navbar.css'

interface NavbarProps {
  showBack?: boolean
  onBack?: () => void
}

export default function Navbar({ showBack, onBack }: NavbarProps) {
  const { t } = useTranslation()

  return (
    <div className="navbar-container">
      <div className="navbar-wrapper">
        <div className="navbar-inner-wrapper">
          {showBack && onBack && (
            <button type="button" className="nav-back-btn" onClick={onBack}>
              ← {t('nav.back')}
            </button>
          )}
          <Box className="nav-title-text">
            <Typography className="nav-title-main-text">{t('nav.title')}</Typography>
            <Typography className="nav-title-sub-text">{t('nav.subtitle')}</Typography>
          </Box>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
