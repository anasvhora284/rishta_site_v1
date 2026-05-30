import EditNoteIcon from '@mui/icons-material/EditNote'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import SiteNavbar from '@/components/SiteNavbar'
import TeamSection from '@/components/TeamSection'
import '@/pages/Browse/Filter.css'
import './Home.css'

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.background = '#DBE3F0'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <div className="FilterPageMainDiv">
      <div className="filter-page-container">
        <SiteNavbar />

        <div className="home-actions-wrapper container">
          <div id="home-actions-box">
            <div className="home-actions-container">
              <Typography className="home-welcome-text" textAlign="center">
                {t('home.welcome')}
              </Typography>
              <Typography className="home-confidential-text" textAlign="center">
                {t('home.confidential')}
              </Typography>

              <div className="home-action-buttons">
                <Button
                  variant="contained"
                  className="home-action-btn"
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/filter')}
                >
                  {t('nav.browse')}
                </Button>
                <Button
                  variant="contained"
                  className="home-action-btn"
                  startIcon={<EditNoteIcon />}
                  onClick={() => navigate('/submit')}
                >
                  {t('nav.submit')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Box id="contact">
          <TeamSection />
        </Box>
      </div>
    </div>
  )
}
