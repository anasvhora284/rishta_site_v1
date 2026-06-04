import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined'
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined'
import { Collapse, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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

interface ListingTopBarProps {
  profiles: Profile[]
  viewMode: ListingViewMode
  onViewModeChange: (mode: ListingViewMode) => void
  onJumpToIndex: (index: number) => void
  onJumpToListItem: (profileId: string) => void
  onOpenFilters: () => void
  /** Card view position (optional) */
  cardIndex?: number
}

export default function ListingTopBar({
  profiles,
  viewMode,
  onViewModeChange,
  onJumpToIndex,
  onJumpToListItem,
  onOpenFilters,
  cardIndex = 0,
}: ListingTopBarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [idInput, setIdInput] = useState('')
  const [jumpError, setJumpError] = useState('')
  const jumpInputRef = useRef<HTMLInputElement>(null)

  const count = profiles.length
  const currentProfile = profiles[cardIndex]
  const safeCardIndex = count > 0 ? Math.min(Math.max(0, cardIndex), count - 1) : 0

  useEffect(() => {
    if (!searchOpen) return
    const timer = window.setTimeout(() => jumpInputRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [searchOpen])

  const toggleViewMode = () => {
    onViewModeChange(viewMode === 'card' ? 'list' : 'card')
  }

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
    if (viewMode === 'card') onJumpToIndex(index)
    else onJumpToListItem(profiles[index].id)
    setSearchOpen(false)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setJumpError('')
  }

  return (
    <header className="listing-topbar">
      <div className="listing-topbar__row">
        <Tooltip title={t('nav.back')}>
          <IconButton
            className="listing-topbar__btn"
            onClick={() => navigate('/filter')}
            aria-label={t('nav.back')}
            size="small"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <div className="listing-topbar__meta">
          <span className="listing-topbar__count">
            {count > 0
              ? t('listing.resultsTitle', { count })
              : t('listing.noResults')}
          </span>
          {viewMode === 'card' && count > 0 && (
            <span className="listing-topbar__position" aria-live="polite">
              {currentProfile?.profile_id != null && (
                <>
                  <span className="listing-topbar__id">ID {currentProfile.profile_id}</span>
                  <span className="listing-topbar__dot" aria-hidden>
                    ·
                  </span>
                </>
              )}
              {t('listing.profileCount', {
                current: safeCardIndex + 1,
                total: count,
              })}
            </span>
          )}
        </div>

        <div className="listing-topbar__actions">
          {count > 0 && (
            <>
              <Tooltip
                title={viewMode === 'card' ? t('listing.switchToList') : t('listing.switchToCards')}
              >
                <IconButton
                  className="listing-topbar__btn"
                  onClick={toggleViewMode}
                  aria-label={t('listing.viewMode')}
                  size="small"
                >
                  {viewMode === 'card' ? (
                    <ViewListOutlinedIcon fontSize="small" />
                  ) : (
                    <ViewCarouselOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title={searchOpen ? t('listing.closeSearch') : t('listing.searchById')}>
                <IconButton
                  className={`listing-topbar__btn ${searchOpen ? 'is-active' : ''}`}
                  onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                  aria-label={searchOpen ? t('listing.closeSearch') : t('listing.searchById')}
                  aria-expanded={searchOpen}
                  size="small"
                >
                  {searchOpen ? <CloseIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title={t('listing.editFilters')}>
            <IconButton
              className="listing-topbar__btn"
              onClick={onOpenFilters}
              aria-label={t('listing.editFilters')}
              size="small"
            >
              <TuneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <Collapse in={searchOpen} unmountOnExit>
        <div className="listing-topbar__search">
          <TextField
            inputRef={jumpInputRef}
            fullWidth
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
              if (e.key === 'Escape') closeSearch()
            }}
            className="listing-topbar__search-input"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleJump}
                    aria-label={t('listing.jumpGo')}
                    className="listing-topbar__search-go"
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            inputProps={{ min: 1, 'aria-label': t('listing.jumpPlaceholder') }}
          />
          {jumpError && (
            <p className="listing-topbar__search-error" role="alert">
              {jumpError}
            </p>
          )}
        </div>
      </Collapse>
    </header>
  )
}
