import ListingFilterDialog from '@/components/browse/ListingFilterDialog'
import ListingPageBackground from '@/components/browse/ListingPageBackground'
import ListingListView from '@/components/ListingListView'
import ListingTopBar, {
  getStoredListingViewMode,
  storeListingViewMode,
  type ListingViewMode,
} from '@/components/ListingTopBar'
import SwipeableProfileStack from '@/components/SwipeableProfileStack'
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import emptySearch from '@/assets/EmptyState.svg'
import type { RootState } from '@/duck/store'
import './Listing.css'

export default function ListingPage() {
  const { t } = useTranslation()
  const filteredData = useSelector((state: RootState) => state.filter.filteredData)
  const [viewMode, setViewMode] = useState<ListingViewMode>(getStoredListingViewMode)
  const [cardIndex, setCardIndex] = useState(0)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [listScrollTargetId, setListScrollTargetId] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
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
      <ListingPageBackground />

      {filteredData.length > 0 ? (
        <>
          <ListingTopBar
            profiles={filteredData}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onJumpToIndex={setCardIndex}
            onJumpToListItem={jumpToListItem}
            onOpenFilters={() => setFilterDialogOpen(true)}
            cardIndex={cardIndex}
          />

          <ListingFilterDialog
            open={filterDialogOpen}
            onClose={() => setFilterDialogOpen(false)}
            onApplied={() => setCardIndex(0)}
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
        <>
          <ListingTopBar
            profiles={[]}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onJumpToIndex={() => {}}
            onJumpToListItem={() => {}}
            onOpenFilters={() => setFilterDialogOpen(true)}
          />

          <ListingFilterDialog
            open={filterDialogOpen}
            onClose={() => setFilterDialogOpen(false)}
            onApplied={() => setCardIndex(0)}
          />

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
        </>
      )}
    </div>
  )
}
