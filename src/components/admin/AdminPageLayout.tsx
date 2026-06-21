import { Box, Typography } from '@mui/material'
import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import SiteNavbar from '@/components/SiteNavbar'
import '@/pages/Browse/Filter.css'
import '@/pages/Admin/Admin.css'

interface AdminPageLayoutProps {
  children: ReactNode
  showBack?: boolean
  onBack?: () => void
  variant?: 'dashboard' | 'detail'
}

export default function AdminPageLayout({
  children,
  showBack,
  onBack,
  variant = 'dashboard',
}: AdminPageLayoutProps) {
  const { t } = useTranslation()

  useEffect(() => {
    document.body.style.background = '#DBE3F0'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  const isDetail = variant === 'detail'

  return (
    <div className="FilterPageMainDiv">
      <div className={`filter-page-container${isDetail ? ' filter-page-container--admin-detail' : ''}`}>
        <SiteNavbar showBack={showBack} onBack={onBack} />

        {isDetail ? (
          <main className="admin-detail-shell page-content-zone">{children}</main>
        ) : (
          <div id="admin-box-wrapper" className="page-content-zone">
            <div className="admin-box-container">
              <Box className="admin-box-header">
                <Typography className="admin-box-header__title">{t('admin.dashboard')}</Typography>
                <Typography className="admin-box-header__subtitle">{t('admin.subtitle')}</Typography>
              </Box>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
