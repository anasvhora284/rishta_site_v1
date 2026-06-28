import {
  Alert,
  Box,
  Button,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import AdminPageLayout from '@/components/admin/AdminPageLayout'
import Loader from '@/components/Loader'
import {
  isAdminSession,
  updateOwnAdminPassword,
  verifyAdminPasswordResetGate,
} from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
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
    <AdminPageLayout
      showBack
      onBack={() => navigate('/admin')}
      pageTitle={t('admin.resetPasswordTitle')}
      pageSubtitle={t('admin.resetPasswordHint')}
    >
      <Box className="admin-reset-form" component="form" onSubmit={(e) => void handleSubmit(e)}>
        <TextField
          fullWidth
          size="small"
          type="password"
          label={t('admin.resetGatePassword')}
          value={gatePassword}
          onChange={(e) => setGatePassword(e.target.value)}
          required
          autoComplete="off"
        />
        <TextField
          fullWidth
          size="small"
          type="password"
          label={t('admin.resetNewPassword')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <TextField
          fullWidth
          size="small"
          type="password"
          label={t('admin.resetConfirmPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        {error && (
          <Alert severity="error" className="admin-shell__alert">
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" className="admin-shell__alert">
            {success}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          className="admin-btn admin-btn--approve admin-reset-form__submit"
        >
          {t('admin.resetPasswordSubmit')}
        </Button>
      </Box>
    </AdminPageLayout>
  )
}
