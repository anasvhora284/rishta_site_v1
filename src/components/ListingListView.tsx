import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { CircularProgress, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProfileCard from '@/components/ProfileCard'
import { useIncrementalVisibleCount } from '@/hooks/useIncrementalVisibleCount'
import type { Profile } from '@/types/profile'
import '@/pages/Browse/Listing.css'

export const LISTING_TOP_ANCHOR_ID = 'listing-top-anchor'

interface ListingListViewProps {
  profiles: Profile[]
  /** Jump-to-ID: parent sets this profile uuid to scroll after expanding the list. */
  scrollToProfileId?: string | null
  onScrollToProfileIdHandled?: () => void
}

export default function ListingListView({
  profiles,
  scrollToProfileId = null,
  onScrollToProfileIdHandled,
}: ListingListViewProps) {
  const { t } = useTranslation()
  const [showGoTop, setShowGoTop] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const { visibleCount, loadMore, ensureIndexVisible, hasMore } = useIncrementalVisibleCount(
    profiles.length,
  )

  const visibleProfiles = profiles.slice(0, visibleCount)

  useEffect(() => {
    const onScroll = () => setShowGoTop(window.scrollY > 320)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!scrollToProfileId) return
    const index = profiles.findIndex((p) => p.id === scrollToProfileId)
    ensureIndexVisible(index)
  }, [scrollToProfileId, profiles, ensureIndexVisible])

  useEffect(() => {
    if (!scrollToProfileId) return
    const el = document.getElementById(`listing-item-${scrollToProfileId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onScrollToProfileIdHandled?.()
  }, [scrollToProfileId, visibleCount, onScrollToProfileIdHandled])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: null, rootMargin: '400px 0px', threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  const scrollToTop = () => {
    document.getElementById(LISTING_TOP_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div id={LISTING_TOP_ANCHOR_ID} className="listing-list__anchor" aria-hidden />

      <p className="listing-list__status" aria-live="polite">
        {t('listing.listShowing', {
          shown: visibleProfiles.length,
          total: profiles.length,
        })}
      </p>

      <div className="listing-list">
        {visibleProfiles.map((profile) => (
          <div key={profile.id} id={`listing-item-${profile.id}`} className="listing-list__item">
            <ProfileCard profile={profile} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="listing-list__sentinel" aria-hidden>
          <CircularProgress size={28} sx={{ color: '#ffb144' }} />
          <Typography variant="body2" className="listing-list__loading-more">
            {t('listing.listLoadingMore')}
          </Typography>
        </div>
      )}

      {showGoTop && (
        <button
          type="button"
          className="listing-go-top"
          onClick={scrollToTop}
          aria-label={t('listing.goToTop')}
        >
          <KeyboardArrowUpIcon />
          <span>{t('listing.goToTop')}</span>
        </button>
      )}
    </>
  )
}
