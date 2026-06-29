import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import './ScrollAreaHint.css'

interface ScrollAreaHintProps {
  children: ReactNode
  className?: string
}

export default function ScrollAreaHint({ children, className = '' }: ScrollAreaHintProps) {
  const { t } = useTranslation()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [showHint, setShowHint] = useState(false)

  const updateHint = useCallback(() => {
    const el = viewportRef.current
    if (!el) {
      setShowHint(false)
      return
    }
    const canScroll = el.scrollHeight > el.clientHeight + 4
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10
    setShowHint(canScroll && !atBottom)
  }, [])

  useLayoutEffect(() => {
    updateHint()
  }, [updateHint, children])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    el.addEventListener('scroll', updateHint, { passive: true })
    const observer = new ResizeObserver(() => updateHint())
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', updateHint)
      observer.disconnect()
    }
  }, [updateHint])

  return (
    <div className={`scroll-area-hint ${className}`.trim()}>
      <div ref={viewportRef} className="scroll-area-hint__viewport">
        {children}
      </div>
      {showHint && (
        <div className="scroll-area-hint__overlay" aria-hidden>
          <span className="scroll-area-hint__fade" />
          <span className="scroll-area-hint__chevron">
            <KeyboardArrowDownIcon fontSize="small" />
          </span>
          <span className="visually-hidden">{t('listing.scrollForMore')}</span>
        </div>
      )}
    </div>
  )
}
