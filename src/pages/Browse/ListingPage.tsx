import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TuneIcon from '@mui/icons-material/Tune'
import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import emptySearch from '@/assets/EmptyState.svg'
import backgroundImg from '@/assets/SearchPage.png'
import ProfileCard from '@/components/ProfileCard'
import SwipeableProfileStack from '@/components/SwipeableProfileStack'
import type { RootState } from '@/duck/store'
import './Listing.css'

export default function ListingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const filteredData = useSelector((state: RootState) => state.filter.filteredData)

  useEffect(() => {
    document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${backgroundImg}) no-repeat fixed center/cover`
    window.scrollTo(0, 0)
    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <div className="listing-page">
      <header className="listing-page__toolbar">
        <IconButton
          className="listing-page__icon-btn"
          onClick={() => navigate('/filter')}
          aria-label={t('nav.back')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography className="listing-page__title">
          {filteredData.length > 0
            ? t('listing.resultsTitle', { count: filteredData.length })
            : t('listing.noResults')}
        </Typography>
        <IconButton
          className="listing-page__icon-btn"
          onClick={() => navigate('/filter')}
          aria-label={t('listing.filterAgain')}
        >
          <TuneIcon />
        </IconButton>
      </header>

      {filteredData.length > 0 ? (
        isMobile ? (
          <SwipeableProfileStack profiles={filteredData} />
        ) : (
          <div className="listing-page__desktop-list">
            {filteredData.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )
      ) : (
        <Box className="no-data-wrapper">
          <Box className="no-data-inner-box">
            <img src={emptySearch} alt="" />
            <p className="no-results-text">{t('listing.noResults')}</p>
            <p className="no-result-sub-text">{t('listing.noResultsHint')}</p>
            <button type="button" onClick={() => navigate('/filter')} className="filter-again-btn">
              {t('listing.filterAgain')}
            </button>
          </Box>
        </Box>
      )}
    </div>
  )
}
