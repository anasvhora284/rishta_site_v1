import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Profile } from '@/types/profile'
import ProfileCard from './ProfileCard'
import './SwipeableProfileStack.css'

const SWIPE_THRESHOLD = 60

interface SwipeableProfileStackProps {
  profiles: Profile[]
  /** Controlled card index (for jump-to-ID from parent). */
  index?: number
  onIndexChange?: (index: number) => void
}

export default function SwipeableProfileStack({
  profiles,
  index: controlledIndex,
  onIndexChange,
}: SwipeableProfileStackProps) {
  const { t } = useTranslation()
  const [internalIndex, setInternalIndex] = useState(0)
  const index = controlledIndex ?? internalIndex

  const setIndex = (next: number | ((prev: number) => number)) => {
    const resolved = typeof next === 'function' ? next(index) : next
    if (onIndexChange) onIndexChange(resolved)
    else setInternalIndex(resolved)
  }
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const dragXRef = useRef(0)

  const count = profiles.length
  const current = profiles[index]

  useEffect(() => {
    setIndex(0)
    setDragX(0)
    dragXRef.current = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset deck when filter results change
  }, [profiles])

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, count - 1))
    setDragX(0)
  }, [count])

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0))
    setDragX(0)
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - startX.current
    dragXRef.current = delta
    setDragX(delta)
  }

  const onTouchEnd = () => {
    setIsDragging(false)
    const delta = dragXRef.current
    if (delta < -SWIPE_THRESHOLD && index < count - 1) goNext()
    else if (delta > SWIPE_THRESHOLD && index > 0) goPrev()
    else {
      setDragX(0)
      dragXRef.current = 0
    }
  }

  if (!current) return null

  return (
    <div className="swipe-stack">
      <p className="swipe-stack__hint">{t('listing.swipeHint')}</p>

      <div
        className="swipe-stack__deck"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {index < count - 1 && (
          <div className="swipe-stack__card swipe-stack__card--behind" aria-hidden>
            <ProfileCard profile={profiles[index + 1]} compact />
          </div>
        )}

        <div
          className={`swipe-stack__card swipe-stack__card--active ${isDragging ? 'dragging' : ''}`}
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)',
          }}
        >
          <ProfileCard profile={current} compact />
        </div>
      </div>

      <div className="swipe-stack__nav">
        <button
          type="button"
          className="swipe-stack__nav-btn"
          onClick={goPrev}
          disabled={index === 0}
          aria-label={t('listing.previous')}
        >
          <ChevronLeftIcon />
        </button>

        <div className="swipe-stack__position" aria-live="polite">
          {current.profile_id != null && (
            <span className="swipe-stack__id">ID {current.profile_id}</span>
          )}
          <span className="swipe-stack__count">
            {t('listing.profileCount', { current: index + 1, total: count })}
          </span>
        </div>

        <button
          type="button"
          className="swipe-stack__nav-btn"
          onClick={goNext}
          disabled={index === count - 1}
          aria-label={t('listing.next')}
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}
