import type { AdminStats, AdminTab } from '@/components/admin/adminTypes'
import { useTranslation } from 'react-i18next'

interface AdminStatsCardsProps {
  tab: AdminTab
  stats: AdminStats
  onTabChange: (tab: AdminTab) => void
}

const PRIMARY_TABS: AdminTab[] = ['pending', 'approved', 'rejected']
const SECONDARY_TABS: AdminTab[] = ['all']

function StatCard({
  tabKey,
  count,
  label,
  active,
  onClick,
  variant = 'primary',
}: {
  tabKey: AdminTab | 'hidden'
  count: number
  label: string
  active?: boolean
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'info'
}) {
  const isButton = variant !== 'info'

  const className = [
    'admin-stat-card',
    `admin-stat-card--${tabKey}`,
    variant === 'secondary' ? 'admin-stat-card--secondary' : '',
    active ? 'admin-stat-card--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span className="admin-stat-card__count">{count}</span>
      <span className="admin-stat-card__label">{label}</span>
    </>
  )

  if (!isButton) {
    return (
      <div className={className} aria-label={label}>
        {content}
      </div>
    )
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  )
}

export default function AdminStatsCards({ tab, stats, onTabChange }: AdminStatsCardsProps) {
  const { t } = useTranslation()

  const labels: Record<AdminTab, string> = {
    pending: t('admin.pending'),
    approved: t('admin.approved'),
    rejected: t('admin.rejected'),
    all: t('admin.tabAll'),
  }

  const counts: Record<AdminTab, number> = {
    pending: stats.pending,
    approved: stats.approved,
    rejected: stats.rejected,
    all: stats.pending + stats.approved + stats.rejected,
  }

  return (
    <div className="admin-stats-cards">
      <div className="admin-stats-cards__row admin-stats-cards__row--primary">
        {PRIMARY_TABS.map((key) => (
          <StatCard
            key={key}
            tabKey={key}
            count={counts[key]}
            label={labels[key]}
            active={tab === key}
            onClick={() => onTabChange(key)}
          />
        ))}
      </div>

      <div className="admin-stats-cards__row admin-stats-cards__row--secondary">
        {SECONDARY_TABS.map((key) => (
          <StatCard
            key={key}
            tabKey={key}
            count={counts[key]}
            label={labels[key]}
            active={tab === key}
            onClick={() => onTabChange(key)}
            variant="secondary"
          />
        ))}
        <StatCard
          tabKey="hidden"
          count={stats.hidden}
          label={t('admin.stats.hidden')}
          variant="info"
        />
      </div>
    </div>
  )
}
