import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TuneIcon from '@mui/icons-material/Tune'
import { Box, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import emptySearch from '@/assets/EmptyState.svg'
import backgroundImg from '@/assets/SearchPage.png'
import ListingFilterDialog from '@/components/browse/ListingFilterDialog'
import ListingListView from '@/components/ListingListView'
import ListingViewToolbar, {
  getStoredListingViewMode,
  storeListingViewMode,
  type ListingViewMode,
} from '@/components/ListingViewToolbar'
import SwipeableProfileStack from '@/components/SwipeableProfileStack'
import type { RootState } from '@/duck/store'
import './Listing.css'

export default function ListingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const filteredData = useSelector((state: RootState) => state.filter.filteredData)
  const [viewMode, setViewMode] = useState<ListingViewMode>(getStoredListingViewMode)
  const [cardIndex, setCardIndex] = useState(0)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [listScrollTargetId, setListScrollTargetId] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${backgroundImg}) no-repeat fixed center/cover`
    window.scrollTo(0, 0)
    return () => {
      document.body.style.background = ''
    }
  }, [])

  useEffect(() => {
    setCardIndex(0)
  }, [filteredData])

  const handleViewModeChange = (mode: ListingViewMode) => {
    setViewMode(mode)
    storeListingViewMode(mode)
  }

  const jumpToListItem = (profileUuid: string) => {
    setListScrollTargetId(profileUuid)
  }

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
          onClick={() => setFilterDialogOpen(true)}
          aria-label={t('listing.editFilters')}
        >
          <TuneIcon />
        </IconButton>
      </header>

      <ListingFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        onApplied={() => setCardIndex(0)}
      />

      {filteredData.length > 0 ? (
        <>
          <ListingViewToolbar
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            profiles={filteredData}
            onJumpToIndex={setCardIndex}
            onJumpToListItem={jumpToListItem}
          />

          {viewMode === 'card' ? (
            <SwipeableProfileStack
              profiles={filteredData}
              index={cardIndex}
              onIndexChange={setCardIndex}
            />
          ) : (
            <ListingListView
              profiles={filteredData}
              scrollToProfileId={listScrollTargetId}
              onScrollToProfileIdHandled={() => setListScrollTargetId(null)}
            />
          )}
        </>
      ) : (
        <Box className="no-data-wrapper">
          <Box className="no-data-inner-box">
            <img src={emptySearch} alt="" />
            <p className="no-results-text">{t('listing.noResults')}</p>
            <p className="no-result-sub-text">{t('listing.noResultsHint')}</p>
            <button
              type="button"
              onClick={() => setFilterDialogOpen(true)}
              className="filter-again-btn"
            >
              {t('listing.editFilters')}
            </button>
          </Box>
        </Box>
      )}
    </div>
  )
}
