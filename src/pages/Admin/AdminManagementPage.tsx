import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Loader from '@/components/Loader'
import SiteNavbar from '@/components/SiteNavbar'
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUserRow,
} from '@/hooks/useAdminUsers'
import { isSuperUserSession } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import '@/pages/Browse/Filter.css'
import '@/pages/Admin/Admin.css'

type FormMode = 'create' | 'edit'

const emptyForm = { name: '', email: '', password: '' }

export default function AdminManagementPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [authReady, setAuthReady] = useState(false)
  const [isSuper, setIsSuper] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [admins, setAdmins] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [editingAdmin, setEditingAdmin] = useState<AdminUserRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadAdmins = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: listError } = await listAdminUsers()
    if (listError) {
      setError(listError.message)
      setAdmins([])
    } else {
      setAdmins((data as AdminUserRow[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const verify = async () => {
      const { data } = await supabase.auth.getSession()
      let session = data.session
      if (session) {
        await supabase.auth.refreshSession()
        const refreshed = await supabase.auth.getSession()
        session = refreshed.data.session ?? session
      }
      if (!isSuperUserSession(session)) {
        navigate('/admin')
        return
      }
      setIsSuper(true)
      setCurrentUserId(session!.user.id)
      setAuthReady(true)
      void loadAdmins()
    }
    void verify()
  }, [loadAdmins, navigate])

  const openCreate = () => {
    setFormMode('create')
    setEditingAdmin(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (admin: AdminUserRow) => {
    setFormMode('edit')
    setEditingAdmin(admin)
    setForm({ name: admin.name, email: admin.email, password: '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    if (formMode === 'create') {
      const { error: createError } = await createAdminUser(form.email, form.password, form.name)
      if (createError) setError(createError.message)
      else {
        setDialogOpen(false)
        await loadAdmins()
      }
    } else if (editingAdmin) {
      const { error: updateError } = await updateAdminUser(
        editingAdmin.id,
        form.email,
        form.name,
        form.password || undefined,
      )
      if (updateError) setError(updateError.message)
      else {
        setDialogOpen(false)
        await loadAdmins()
      }
    }
    setSaving(false)
  }

  const handleDelete = async (admin: AdminUserRow) => {
    if (!window.confirm(t('admin.manageDeleteConfirm', { name: admin.name || admin.email }))) return
    setError('')
    const { error: deleteError } = await deleteAdminUser(admin.id)
    if (deleteError) setError(deleteError.message)
    else await loadAdmins()
  }

  if (!authReady || !isSuper) return <Loader />

  return (
    <div className="FilterPageMainDiv">
      <div className="filter-page-container">
        <SiteNavbar showBack onBack={() => navigate('/admin')} />
        <Box className="page-content-zone admin-content">
          <Box className="admin-header">
            <Box className="admin-header__title-row">
              <ManageAccountsIcon sx={{ color: 'rgb(174, 0, 61)' }} />
              <Typography variant="h5" fontWeight={700}>
                {t('admin.manageTitle')}
              </Typography>
            </Box>
            <Button
              variant="contained"
              className="admin-btn admin-btn--approve"
              startIcon={<AddIcon />}
              onClick={openCreate}
            >
              {t('admin.manageCreate')}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Loader variant="inline" />
          ) : !admins.length ? (
            <Typography color="text.secondary" textAlign="center">
              {t('admin.manageEmpty')}
            </Typography>
          ) : (
            admins.map((admin) => (
              <Box key={admin.id} className="admin-card">
                <Typography fontWeight={700} mb={0.5}>
                  {admin.name || admin.email}
                  {admin.role === 'superuser' && (
                    <Typography component="span" variant="body2" color="primary" ml={1}>
                      ({t('admin.superuserBadge')})
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {admin.email}
                </Typography>
                <Box className="admin-card-actions">
                  <Button
                    variant="outlined"
                    className="admin-btn admin-btn--edit"
                    startIcon={<EditIcon />}
                    onClick={() => openEdit(admin)}
                  >
                    {t('admin.manageEdit')}
                  </Button>
                  <Button
                    variant="outlined"
                    className="admin-btn admin-btn--reject"
                    startIcon={<DeleteIcon />}
                    disabled={admin.id === currentUserId}
                    onClick={() => void handleDelete(admin)}
                  >
                    {t('admin.manageDelete')}
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle className="admin-dialog-title">
            {formMode === 'create' ? t('admin.manageCreate') : t('admin.manageEdit')}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('admin.manageName')}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              sx={{ mt: 1, mb: 2 }}
              required
            />
            <TextField
              fullWidth
              type="email"
              label={t('admin.email')}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              type="password"
              label={
                formMode === 'create' ? t('admin.password') : t('admin.manageNewPasswordOptional')
              }
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required={formMode === 'create'}
              autoComplete="new-password"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button className="admin-btn admin-btn--edit" onClick={() => setDialogOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button
              variant="contained"
              className="admin-btn admin-btn--approve"
              disabled={saving || !form.name.trim() || !form.email.trim() || (formMode === 'create' && form.password.length < 8)}
              onClick={() => void handleSave()}
            >
              {t('admin.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}
