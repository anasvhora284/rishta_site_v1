import SearchIcon from '@mui/icons-material/Search'
import LogoutIcon from '@mui/icons-material/Logout'
import LockResetIcon from '@mui/icons-material/LockReset'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { Alert, Box, Button, InputAdornment, TextField, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import AdminStatsCards from '@/components/admin/AdminStatsCards'
import type { AdminStats, AdminTab } from '@/components/admin/adminTypes'

interface AdminShellProps {
  tab: AdminTab
  onTabChange: (tab: AdminTab) => void
  search: string
  onSearchChange: (value: string) => void
  stats: AdminStats
  resultCount: number
  error?: string | null
  actionError?: string
  isSuperUser?: boolean
  onManageAdmins?: () => void
  onResetPassword?: () => void
  onSignOut: () => void
  children: ReactNode
}

export default function AdminShell({
  tab,
  onTabChange,
  search,
  onSearchChange,
  stats,
  resultCount,
  error,
  actionError,
  isSuperUser = false,
  onManageAdmins,
  onResetPassword,
  onSignOut,
  children,
}: AdminShellProps) {
  const { t } = useTranslation()

  return (
    <Box className="admin-shell">
      <Box className="admin-toolbar">
        <TextField
          fullWidth
          size="small"
          className="admin-toolbar__search"
          placeholder={t('admin.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'rgb(174, 0, 61)' }} />
              </InputAdornment>
            ),
          }}
        />
        <Box className="admin-toolbar__actions">
          <Button
            variant="outlined"
            size="small"
            className="admin-btn admin-btn--edit"
            startIcon={<LockResetIcon />}
            onClick={onResetPassword}
          >
            {t('admin.resetPasswordLink')}
          </Button>
          {isSuperUser && (
            <Button
              variant="outlined"
              size="small"
              className="admin-btn admin-btn--edit"
              startIcon={<ManageAccountsIcon />}
              onClick={onManageAdmins}
            >
              {t('admin.manageLink')}
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            className="admin-btn admin-btn--sign-out"
            startIcon={<LogoutIcon />}
            onClick={onSignOut}
          >
            {t('admin.signOut')}
          </Button>
        </Box>
      </Box>

      <AdminStatsCards tab={tab} stats={stats} onTabChange={onTabChange} />

      <Typography variant="body2" className="admin-shell__count">
        {t('admin.resultCount', { count: resultCount })}
      </Typography>

      {error && (
        <Alert severity="error" className="admin-shell__alert">
          {error}
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" className="admin-shell__alert">
          {actionError}
        </Alert>
      )}

      <Box className="admin-shell__body">{children}</Box>
    </Box>
  )
}
