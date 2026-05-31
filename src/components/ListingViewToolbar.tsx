import SearchIcon from '@mui/icons-material/Search'
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined'
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined'
import { Alert, Box, IconButton, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Profile } from '@/types/profile'
import '@/pages/Browse/Listing.css'

export type ListingViewMode = 'card' | 'list'

const VIEW_STORAGE_KEY = 'rishta-listing-view'

export function getStoredListingViewMode(): ListingViewMode {
  try {
    const v = sessionStorage.getItem(VIEW_STORAGE_KEY)
    return v === 'list' ? 'list' : 'card'
  } catch {
    return 'card'
  }
}

export function storeListingViewMode(mode: ListingViewMode) {
  try {
    sessionStorage.setItem(VIEW_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

interface ListingViewToolbarProps {
  viewMode: ListingViewMode
  onViewModeChange: (mode: ListingViewMode) => void
  profiles: Profile[]
  onJumpToIndex: (index: number) => void
  onJumpToListItem: (profileId: string) => void
}

export default function ListingViewToolbar({
  viewMode,
  onViewModeChange,
  profiles,
  onJumpToIndex,
  onJumpToListItem,
}: ListingViewToolbarProps) {
  const { t } = useTranslation()
  const [idInput, setIdInput] = useState('')
  const [jumpError, setJumpError] = useState('')

  const handleJump = () => {
    const target = Number.parseInt(idInput.trim(), 10)
    if (!Number.isFinite(target) || target < 1) {
      setJumpError(t('listing.jumpInvalid'))
      return
    }

    const index = profiles.findIndex((p) => p.profile_id === target)
    if (index < 0) {
      setJumpError(t('listing.jumpNotFound', { id: target }))
      return
    }

    setJumpError('')
    if (viewMode === 'card') {
      onJumpToIndex(index)
    } else {
      onJumpToListItem(profiles[index].id)
    }
  }

  return (
    <Box className="listing-toolbar">
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        size="small"
        className="listing-toolbar__view-toggle"
        onChange={(_, value: ListingViewMode | null) => {
          if (value) onViewModeChange(value)
        }}
        aria-label={t('listing.viewMode')}
      >
        <ToggleButton value="card" aria-label={t('listing.viewCards')}>
          <ViewCarouselOutlinedIcon fontSize="small" />
          <span className="listing-toolbar__view-label">{t('listing.viewCards')}</span>
        </ToggleButton>
        <ToggleButton value="list" aria-label={t('listing.viewList')}>
          <ViewListOutlinedIcon fontSize="small" />
          <span className="listing-toolbar__view-label">{t('listing.viewList')}</span>
        </ToggleButton>
      </ToggleButtonGroup>

      <Box className="listing-toolbar__jump">
        <TextField
          size="small"
          type="number"
          inputMode="numeric"
          placeholder={t('listing.jumpPlaceholder')}
          value={idInput}
          onChange={(e) => {
            setIdInput(e.target.value)
            setJumpError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleJump()
          }}
          className="listing-toolbar__jump-input"
          inputProps={{ min: 1, 'aria-label': t('listing.jumpPlaceholder') }}
        />
        <IconButton
          className="listing-toolbar__jump-btn"
          onClick={handleJump}
          aria-label={t('listing.jumpGo')}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {jumpError && (
        <Alert severity="warning" className="listing-toolbar__jump-error">
          {jumpError}
        </Alert>
      )}
    </Box>
  )
}
