import BlockIcon from '@mui/icons-material/Block'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import LogoutIcon from '@mui/icons-material/Logout'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
// import AdminBrandLogos from '@/components/AdminBrandLogos'
import AdminEditProfileDialog from '@/components/admin/AdminEditProfileDialog'
import Loader from '@/components/Loader'
import SiteNavbar from '@/components/SiteNavbar'
import '@/pages/Browse/Filter.css'
import {
  approveProfile,
  hideProfileFromBrowse,
  isHiddenFromBrowseProfile,
  rejectProfile,
  showProfileOnBrowse,
  useProfiles,
} from '@/hooks/useProfiles'
import { isAdminSession } from '@/lib/adminAuth'
import { supabase } from '@/lib/supabase'
import type { Profile, ProfileStatus } from '@/types/profile'
import './Admin.css'

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ProfileStatus>('pending')
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const authReady = authChecked && !!userId
  const { profiles, loading, error, refetch } = useProfiles(tab, authReady)
  const [editProfile, setEditProfile] = useState<Profile | null>(null)
  const [rejectDialog, setRejectDialog] = useState<Profile | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [actionError, setActionError] = useState('')

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
      } else {
        setUserId(session!.user.id)
      }
      setAuthChecked(true)
    }
    void verify()
  }, [navigate])

  const handleApprove = async (profile: Profile) => {
    if (!userId) return
    setActionError('')
    const { error: approveError } = await approveProfile(profile.id, userId)
    if (approveError) {
      setActionError(approveError.message)
    } else {
      void refetch()
    }
  }

  const handleReject = async () => {
    if (!rejectDialog || !userId) return
    setActionError('')
    const { error: rejectError } = await rejectProfile(rejectDialog.id, rejectNotes, userId)
    if (rejectError) {
      setActionError(rejectError.message)
    } else {
      setRejectDialog(null)
      setRejectNotes('')
      void refetch()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const handleHideFromBrowse = async (profile: Profile) => {
    setActionError('')
    if (!userId) return
    const { error: hideError } = await hideProfileFromBrowse(profile.id, userId)
    if (hideError) {
      setActionError(hideError.message)
    } else {
      void refetch()
    }
  }

  const handleShowOnBrowse = async (profile: Profile) => {
    setActionError('')
    const { error: showError } = await showProfileOnBrowse(profile.id)
    if (showError) {
      setActionError(showError.message)
    } else {
      void refetch()
    }
  }

  if (!authReady) return <Loader />

  return (
    <div className="FilterPageMainDiv">
      <div className="filter-page-container">
        <SiteNavbar showBack onBack={() => navigate('/')} />
        <Box className="page-content-zone admin-content">
          <Box className="admin-header">
            <Box className="admin-header__title-row">
              {/* <AdminBrandLogos size="sm" /> */}
              <Typography variant="h5" fontWeight={700}>
                {t('admin.dashboard')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              className="admin-btn admin-btn--sign-out"
              startIcon={<LogoutIcon />}
              onClick={() => void handleSignOut()}
            >
              {t('admin.signOut')}
            </Button>
          </Box>

          <Tabs value={tab} onChange={(_, v: ProfileStatus) => setTab(v)} sx={{ mb: 3 }}>
            <Tab
              icon={<HourglassEmptyIcon />}
              iconPosition="start"
              label={t('admin.pending')}
              value="pending"
            />
            <Tab
              icon={<CheckCircleIcon />}
              iconPosition="start"
              label={t('admin.approved')}
              value="approved"
            />
            <Tab
              icon={<BlockIcon />}
              iconPosition="start"
              label={t('admin.rejected')}
              value="rejected"
            />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

          {loading ? (
            <Loader variant="inline" />
          ) : !profiles.length ? (
            <Typography color="text.secondary" textAlign="center">{t('admin.noProfiles')}</Typography>
          ) : (
            profiles.map((profile) => (
              <Box key={profile.id} className="admin-card">
                <Typography className="admin-card__name" fontWeight={700} mb={1} title={profile.name}>
                  {profile.name}
                  {profile.profile_id ? ` (ID: ${profile.profile_id})` : ''}
                  {isHiddenFromBrowseProfile(profile) && (
                    <Typography component="span" variant="body2" color="warning.main" ml={1}>
                      ({t('admin.hiddenFromBrowse')})
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {profile.gender} | {profile.city} | {profile.parent_contact}
                </Typography>
                <Typography variant="body2" mb={2}>
                  {profile.father_name} / {profile.mother_name} | {profile.qualification} | {profile.sub_cast}
                </Typography>
                {profile.admin_notes && (
                  <Typography variant="body2" color="error" mb={1}>
                    {t('admin.notes')}: {profile.admin_notes}
                  </Typography>
                )}
                <Box className="admin-card-actions">
                  {tab === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        className="admin-btn admin-btn--approve"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => void handleApprove(profile)}
                      >
                        {t('admin.approve')}
                      </Button>
                      <Button
                        variant="contained"
                        className="admin-btn admin-btn--reject"
                        startIcon={<CancelIcon />}
                        onClick={() => setRejectDialog(profile)}
                      >
                        {t('admin.reject')}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    className="admin-btn admin-btn--edit"
                    startIcon={<EditIcon />}
                    onClick={() => setEditProfile({ ...profile })}
                  >
                    {t('admin.edit')}
                  </Button>
                  {tab === 'approved' && !isHiddenFromBrowseProfile(profile) && (
                    <Button
                      variant="outlined"
                      className="admin-btn admin-btn--hide"
                      startIcon={<VisibilityOffIcon />}
                      onClick={() => void handleHideFromBrowse(profile)}
                    >
                      {t('admin.hideFromBrowse')}
                    </Button>
                  )}
                  {isHiddenFromBrowseProfile(profile) && (
                    <Button
                      variant="outlined"
                      className="admin-btn admin-btn--approve"
                      startIcon={<VisibilityIcon />}
                      onClick={() => void handleShowOnBrowse(profile)}
                    >
                      {t('admin.showOnBrowse')}
                    </Button>
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>

        <Dialog open={!!rejectDialog} onClose={() => setRejectDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle className="admin-dialog-title">
            <CancelIcon color="error" />
            {t('admin.reject')}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('admin.rejectReason')}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              className="admin-btn admin-btn--edit"
              startIcon={<CloseIcon />}
              onClick={() => setRejectDialog(null)}
            >
              {t('admin.cancel')}
            </Button>
            <Button
              variant="contained"
              className="admin-btn admin-btn--reject"
              startIcon={<CancelIcon />}
              onClick={() => void handleReject()}
            >
              {t('admin.reject')}
            </Button>
          </DialogActions>
        </Dialog>

        <AdminEditProfileDialog
          profile={editProfile}
          open={!!editProfile}
          onClose={() => setEditProfile(null)}
          onSaved={() => void refetch()}
        />
      </div>
    </div>
  )
}
