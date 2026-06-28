import LockResetIcon from '@mui/icons-material/LockReset'
import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Loader from '@/components/Loader'
import SiteNavbar from '@/components/SiteNavbar'
import {
  isAdminSession,
  updateOwnAdminPassword,
  verifyAdminPasswordResetGate,
} from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import '@/pages/Browse/Filter.css'
import '@/pages/Admin/Admin.css'

export default function AdminResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [authReady, setAuthReady] = useState(false)
  const [gatePassword, setGatePassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const gateConfigured = Boolean(import.meta.env.VITE_ADMIN_PASSWORD_RESET_GATE?.trim())

  useEffect(() => {
    const verify = async () => {
      const { data } = await supabase.auth.getSession()
      let session = data.session
      if (session) {
        await supabase.auth.refreshSession()
        const refreshed = await supabase.auth.getSession()
        session = refreshed.data.session ?? session
      }
      if (!isAdminSession(session)) {
        navigate('/admin/login')
        return
      }
      setAuthReady(true)
    }
    void verify()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!gateConfigured) {
      setError(t('admin.resetGateNotConfigured'))
      return
    }

    if (!verifyAdminPasswordResetGate(gatePassword)) {
      setError(t('admin.resetGateInvalid'))
      return
    }

    if (newPassword.length < 8) {
      setError(t('admin.resetPasswordTooShort'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('admin.resetPasswordMismatch'))
      return
    }

    setLoading(true)
    const { error: updateError } = await updateOwnAdminPassword(newPassword)
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(t('admin.resetPasswordSuccess'))
    setGatePassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (!authReady) return <Loader />

  return (
    <div className="FilterPageMainDiv">
      <div className="filter-page-container filter-page-container--centered">
        <SiteNavbar showBack onBack={() => navigate('/admin')} />
        <main className="page-content-zone page-content-zone--center page-content-zone--tight-top">
          <Box className="admin-login-box page-card">
            <header className="admin-login-header">
              <LockResetIcon sx={{ color: 'rgb(174, 0, 61)', fontSize: 32 }} />
              <Typography variant="h5" fontWeight={700}>
                {t('admin.resetPasswordTitle')}
              </Typography>
              <Typography className="admin-login-subtitle">{t('admin.resetPasswordHint')}</Typography>
            </header>

            <form onSubmit={(e) => void handleSubmit(e)}>
              <TextField
                fullWidth
                type="password"
                label={t('admin.resetGatePassword')}
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                required
                sx={{ mb: 2 }}
                autoComplete="off"
              />
              <TextField
                fullWidth
                type="password"
                label={t('admin.resetNewPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
                autoComplete="new-password"
              />
              <TextField
                fullWidth
                type="password"
                label={t('admin.resetConfirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 2 }}
                autoComplete="new-password"
              />
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="admin-btn admin-btn--sign-in"
                sx={{ minHeight: 'var(--btn-min-height, 52px)' }}
              >
                {t('admin.resetPasswordSubmit')}
              </Button>
            </form>
          </Box>
        </main>
      </div>
    </div>
  )
}
