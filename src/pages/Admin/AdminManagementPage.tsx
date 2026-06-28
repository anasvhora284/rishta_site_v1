import AddIcon from '@mui/icons-material/Add'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import AdminPageLayout from '@/components/admin/AdminPageLayout'
import Loader from '@/components/Loader'
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUserRow,
} from '@/hooks/useAdminUsers'
import { isSuperUserSession } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import '@/pages/Admin/Admin.css'

type FormMode = 'create' | 'edit'

const emptyForm = { name: '', email: '', password: '' }

function adminInitials(name: string, email: string): string {
  const source = name.trim() || email.split('@')[0] || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

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
    <AdminPageLayout
      showBack
      onBack={() => navigate('/admin')}
      pageTitle={t('admin.manageTitle')}
      pageSubtitle={t('admin.manageSubtitle')}
    >
      <Box className="admin-manage-toolbar">
        <Typography variant="body2" className="admin-manage-toolbar__count">
          {t('admin.manageCount', { count: admins.length })}
        </Typography>
        <Button
          variant="contained"
          size="small"
          className="admin-btn admin-btn--approve admin-manage-toolbar__add"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          {t('admin.manageCreate')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="admin-shell__alert" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Loader variant="inline" />
      ) : !admins.length ? (
        <Typography color="text.secondary" textAlign="center" className="admin-empty">
          {t('admin.manageEmpty')}
        </Typography>
      ) : (
        <Box className="admin-user-list" component="ul">
          {admins.map((admin) => {
            const isSelf = admin.id === currentUserId
            const isSuperuser = admin.role === 'superuser'
            return (
              <Box key={admin.id} className="admin-user-item" component="li">
                <div className="admin-user-item__avatar" aria-hidden>
                  {adminInitials(admin.name, admin.email)}
                </div>
                <div className="admin-user-item__body">
                  <div className="admin-user-item__row1">
                    <span className="admin-user-item__name">{admin.name || admin.email}</span>
                    {isSuperuser && (
                      <span className="admin-user-item__badge">{t('admin.superuserBadge')}</span>
                    )}
                    {isSelf && (
                      <span className="admin-user-item__you">{t('admin.manageYou')}</span>
                    )}
                  </div>
                  <div className="admin-user-item__email">{admin.email}</div>
                </div>
                <div className="admin-user-item__actions">
                  <Tooltip title={t('admin.manageEdit')}>
                    <IconButton
                      size="small"
                      className="admin-user-item__action admin-user-item__action--edit"
                      onClick={() => openEdit(admin)}
                      aria-label={t('admin.manageEdit')}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={isSelf ? t('admin.manageCannotDeleteSelf') : t('admin.manageDelete')}>
                    <span>
                      <IconButton
                        size="small"
                        className="admin-user-item__action admin-user-item__action--delete"
                        disabled={isSelf}
                        onClick={() => void handleDelete(admin)}
                        aria-label={t('admin.manageDelete')}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              </Box>
            )
          })}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="admin-dialog-title">
          <AdminPanelSettingsIcon sx={{ color: 'rgb(174, 0, 61)' }} />
          {formMode === 'create' ? t('admin.manageCreate') : t('admin.manageEdit')}
        </DialogTitle>
        <DialogContent dividers>
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
            disabled={
              saving ||
              !form.name.trim() ||
              !form.email.trim() ||
              (formMode === 'create' && form.password.length < 8)
            }
            onClick={() => void handleSave()}
          >
            {t('admin.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageLayout>
  )
}
