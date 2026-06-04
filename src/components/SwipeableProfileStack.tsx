import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Profile } from '@/types/profile'
import ProfileCard from './ProfileCard'
import './SwipeableProfileStack.css'

const SWIPE_THRESHOLD = 80

type SlidePhase = 'idle' | 'next' | 'prev'

interface SwipeableProfileStackProps {
  profiles: Profile[]
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
  const isControlled = controlledIndex !== undefined
  const index = isControlled ? controlledIndex : internalIndex

  const indexRef = useRef(index)
  indexRef.current = index

  const applyIndex = useCallback(
    (next: number) => {
      const count = profiles.length
      const clamped = count > 0 ? Math.min(Math.max(0, next), count - 1) : 0
      indexRef.current = clamped
      if (onIndexChange) onIndexChange(clamped)
      else setInternalIndex(clamped)
    },
    [onIndexChange, profiles.length],
  )

  const [phase, setPhase] = useState<SlidePhase>('idle')
  const [exitActive, setExitActive] = useState(false)
  const [landInstant, setLandInstant] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const startX = useRef(0)
  const dragXRef = useRef(0)
  const exitStartXRef = useRef(0)
  const finishedRef = useRef(false)
  const slideFromIndexRef = useRef(0)

  const count = profiles.length
  const safeIndex = count > 0 ? Math.min(Math.max(0, index), count - 1) : 0

  /** Frozen for the duration of the slide so layers don't swap mid-animation */
  const slideFromIndex = phase === 'idle' ? safeIndex : slideFromIndexRef.current
  const exitingProfile = profiles[slideFromIndex]
  const nextBehindProfile =
    slideFromIndex < count - 1 ? profiles[slideFromIndex + 1] : null
  const prevBehindProfile = slideFromIndex > 0 ? profiles[slideFromIndex - 1] : null

  const topProfile = profiles[safeIndex]
  const behindProfile = safeIndex < count - 1 ? profiles[safeIndex + 1] : null

  const profilesKey = profiles.map((p) => p.id).join('|')
  const prevProfilesKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (prevProfilesKeyRef.current === profilesKey) return
    const isFirstRun = prevProfilesKeyRef.current === null
    prevProfilesKeyRef.current = profilesKey
    if (isFirstRun) return
    applyIndex(0)
    setPhase('idle')
    setExitActive(false)
    setLandInstant(false)
    setDragX(0)
    dragXRef.current = 0
  }, [profilesKey, applyIndex])

  const isAnimating = phase !== 'idle'

  const finishTransition = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true

    const from = slideFromIndexRef.current
    if (phase === 'next') applyIndex(from + 1)
    else if (phase === 'prev') applyIndex(from - 1)

    setLandInstant(true)
    setPhase('idle')
    setExitActive(false)
    setDragX(0)
    dragXRef.current = 0
    exitStartXRef.current = 0

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setLandInstant(false))
    })
  }, [applyIndex, phase])

  useEffect(() => {
    if (phase === 'idle') {
      setExitActive(false)
      return
    }

    finishedRef.current = false
    setExitActive(false)
    setLandInstant(false)

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setExitActive(true))
    })

    return () => cancelAnimationFrame(raf)
  }, [phase])

  const handlePromoteEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return
    if (e.animationName !== 'swipe-stack-step-forward') return
    finishTransition()
  }

  const beginSlide = useCallback(
    (direction: 'next' | 'prev') => {
      if (isAnimating) return
      if (direction === 'next' && (safeIndex >= count - 1 || !behindProfile)) return
      if (direction === 'prev' && safeIndex <= 0) return

      slideFromIndexRef.current = safeIndex
      exitStartXRef.current = dragXRef.current
      setIsDragging(false)
      setDragX(0)
      dragXRef.current = 0
      setPhase(direction)
    },
    [behindProfile, count, isAnimating, safeIndex],
  )

  const resetDrag = useCallback(() => {
    setDragX(0)
    dragXRef.current = 0
  }, [])

  const finishDrag = useCallback(() => {
    if (isAnimating) return
    setIsDragging(false)
    const delta = dragXRef.current
    if (delta < -SWIPE_THRESHOLD) beginSlide('next')
    else if (delta > SWIPE_THRESHOLD) beginSlide('prev')
    else resetDrag()
  }, [beginSlide, isAnimating, resetDrag])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || isAnimating) return
    startX.current = e.clientX
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || isAnimating) return
    const delta = e.clientX - startX.current
    dragXRef.current = delta
    setDragX(delta)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    finishDrag()
  }

  const onPointerCancel = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    finishDrag()
  }

  if (!topProfile || !exitingProfile) return null

  const showFront = phase === 'idle' || phase === 'next' || phase === 'prev'
  const showBehindNext = nextBehindProfile && phase === 'next'
  const showBehindPrev = phase === 'prev' && prevBehindProfile
  const showIdleBehind = phase === 'idle' && behindProfile

  const frontClass = [
    'swipe-stack__card',
    'swipe-stack__card--front',
    isDragging && phase === 'idle' ? 'is-dragging' : '',
    phase === 'next' ? 'is-exit-next' : '',
    phase === 'prev' ? 'is-exit-prev' : '',
    exitActive ? 'is-exit-active' : '',
    landInstant ? 'is-landed' : '',
    phase !== 'idle' && exitActive ? 'is-hidden-after-exit' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const frontStyle: React.CSSProperties | undefined =
    phase === 'idle'
      ? { transform: `translateX(${dragX}px)` }
      : !exitActive
        ? { transform: `translateX(${exitStartXRef.current}px)` }
        : undefined

  const frontProfile = phase === 'idle' ? topProfile : exitingProfile

  return (
    <div className="swipe-stack">
      <div
        className="swipe-stack__deck"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {showIdleBehind && (
          <div className="swipe-stack__card swipe-stack__card--behind">
            <ProfileCard key={behindProfile.id} profile={behindProfile} compact />
          </div>
        )}

        {showBehindNext && (
          <div
            className="swipe-stack__card swipe-stack__card--behind is-promoting"
            onAnimationEnd={handlePromoteEnd}
          >
            <ProfileCard key={nextBehindProfile.id} profile={nextBehindProfile} compact />
          </div>
        )}

        {showBehindPrev && (
          <div
            className="swipe-stack__card swipe-stack__card--behind is-promoting"
            onAnimationEnd={handlePromoteEnd}
          >
            <ProfileCard key={prevBehindProfile.id} profile={prevBehindProfile} compact />
          </div>
        )}

        {showFront && (
          <div className={frontClass} style={frontStyle}>
            <ProfileCard key={frontProfile.id} profile={frontProfile} compact />
          </div>
        )}
      </div>

      <div className="swipe-stack__nav swipe-stack__nav--compact">
        <button
          type="button"
          className="swipe-stack__nav-btn"
          onClick={() => beginSlide('prev')}
          disabled={safeIndex === 0 || isAnimating}
          aria-label={t('listing.previous')}
        >
          <ChevronLeftIcon />
        </button>

        <button
          type="button"
          className="swipe-stack__nav-btn"
          onClick={() => beginSlide('next')}
          disabled={safeIndex === count - 1 || isAnimating}
          aria-label={t('listing.next')}
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}
