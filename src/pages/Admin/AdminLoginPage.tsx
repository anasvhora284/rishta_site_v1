import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LoginIcon from '@mui/icons-material/Login'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Alert, Box, Button, InputAdornment, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import AdminBrandLogos from '@/components/AdminBrandLogos'
import SiteNavbar from '@/components/SiteNavbar'
import '@/pages/Browse/Filter.css'
import { signInAsAdmin } from '@/lib/adminAuth'
import './Admin.css'

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signInAsAdmin(email.trim(), password)
    if (!result.ok) {
      setError(
        result.code === 'not_admin' ? t('admin.notAdmin') : t('admin.loginError'),
      )
      setLoading(false)
      return
    }
    navigate('/admin')
    setLoading(false)
  }

  return (
    <div className="FilterPageMainDiv">
      <div className="filter-page-container filter-page-container--centered">
        <SiteNavbar showBack onBack={() => navigate('/')} />
        <main className="page-content-zone page-content-zone--center page-content-zone--tight-top">
          <Box className="admin-login-box page-card">
            <header className="admin-login-header">
              <AdminBrandLogos size="md" />
              <Box display="flex" alignItems="center" gap={1}>
                <AdminPanelSettingsIcon sx={{ color: 'rgb(174, 0, 61)', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={700}>
                  {t('admin.login')}
                </Typography>
              </Box>
              <Typography className="admin-login-subtitle">{t('nav.subtitle')}</Typography>
            </header>

            <form onSubmit={(e) => void handleLogin(e)}>
              <TextField
                fullWidth
                type="email"
                label={t('admin.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: 'rgb(174, 0, 61)' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type="password"
                label={t('admin.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'rgb(174, 0, 61)' }} />
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="admin-btn admin-btn--sign-in"
                startIcon={<LoginIcon />}
                sx={{ minHeight: 'var(--btn-min-height, 52px)' }}
              >
                {t('admin.signIn')}
              </Button>
            </form>
          </Box>
        </main>
      </div>
    </div>
  )
}
