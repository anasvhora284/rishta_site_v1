import CloseIcon from '@mui/icons-material/Close'
import { Box, Drawer, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminProfileDetailView from '@/components/admin/AdminProfileDetailView'
import type { Profile } from '@/types/profile'

interface AdminProfileDrawerProps {
  profile: Profile | null
  allProfiles: Profile[]
  open: boolean
  onClose: () => void
  onRefetch: () => void
  onApprove: (profile: Profile) => Promise<boolean>
  onReject: (profile: Profile, notes: string) => Promise<boolean>
  onMerge: (pending: Profile, existing: Profile) => Promise<boolean>
  onHide: (profile: Profile) => Promise<boolean>
  onShow: (profile: Profile) => Promise<boolean>
  initialMode?: 'view' | 'edit'
}

export default function AdminProfileDrawer({
  profile,
  allProfiles,
  open,
  onClose,
  onRefetch,
  onApprove,
  onReject,
  onMerge,
  onHide,
  onShow,
  initialMode = 'view',
}: AdminProfileDrawerProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)

  useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, profile?.id, initialMode])

  const handleClose = () => {
    onClose()
  }

  const withClose =
    <T extends unknown[]>(fn: (...args: T) => Promise<boolean>) =>
    async (...args: T) => {
      const ok = await fn(...args)
      if (ok) handleClose()
      return ok
    }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      className="admin-drawer"
      PaperProps={{ className: 'admin-drawer__paper' }}
    >
      {profile && (
        <Box className="admin-drawer__inner">
          <Box className="admin-drawer__header">
            <IconButton aria-label={t('admin.cancel')} onClick={handleClose} edge="start">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="admin-drawer__title">
              {mode === 'edit' ? t('admin.edit') : t('admin.review')}
            </Typography>
          </Box>
          <Box className="admin-drawer__body">
            <AdminProfileDetailView
              profile={profile}
              allProfiles={allProfiles}
              mode={mode}
              layout="drawer"
              onModeChange={setMode}
              onSaved={onRefetch}
              onApprove={withClose(onApprove)}
              onReject={withClose(onReject)}
              onMerge={withClose(onMerge)}
              onHide={async (p) => {
                const ok = await onHide(p)
                if (ok) onRefetch()
                return ok
              }}
              onShow={async (p) => {
                const ok = await onShow(p)
                if (ok) onRefetch()
                return ok
              }}
            />
          </Box>
        </Box>
      )}
    </Drawer>
  )
}
