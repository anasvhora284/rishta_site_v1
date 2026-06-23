import type { ReactNode } from 'react'
import './RibbonCard.css'

interface RibbonCardProps {
  label: string
  children: ReactNode
  /** Extra classes on the outer wrapper (e.g. layout container hooks). */
  className?: string
  /** Extra classes on the inner white content panel. */
  contentClassName?: string
}

export default function RibbonCard({ label, children, className, contentClassName }: RibbonCardProps) {
  const outerClass = ['ribbon-card', className].filter(Boolean).join(' ')
  const innerClass = ['ribbon-card__content', contentClassName].filter(Boolean).join(' ')

  return (
    <div className={outerClass}>
      <div className="ribbon-card__tag" aria-hidden="true">
        <span className="ribbon-card__label">{label}</span>
        <span className="ribbon-card__fold" />
      </div>
      <div className={innerClass}>{children}</div>
    </div>
  )
}
