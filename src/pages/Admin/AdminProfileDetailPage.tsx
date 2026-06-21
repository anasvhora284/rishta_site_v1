import { Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import AdminPageLayout from '@/components/admin/AdminPageLayout'
import AdminProfileDetailView from '@/components/admin/AdminProfileDetailView'
import Loader from '@/components/Loader'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAdminProfileActions } from '@/hooks/useAdminProfileActions'
import { useAdminProfiles } from '@/hooks/useAdminProfiles'
import '@/pages/Admin/Admin.css'

export default function AdminProfileDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { userId, authReady } = useAdminAuth()
  const { profiles, loading, error, refetch, removeProfileLocally, patchProfileLocally } =
    useAdminProfiles(authReady)

  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')

  useEffect(() => {
    if (window.matchMedia('(min-width: 900px)').matches && id) {
      navigate(`/admin?profile=${id}`, { replace: true })
    }
  }, [id, navigate])

  const profile = useMemo(() => profiles.find((p) => p.id === id) ?? null, [profiles, id])

  const { actionError, approve, reject, merge, hide, show } = useAdminProfileActions({
    userId,
    onRefetch: () => void refetch({ silent: true }),
    removeProfileLocally,
    patchProfileLocally,
  })

  const handleBack = () => {
    try {
      const raw = sessionStorage.getItem('admin-list-state')
      if (raw) {
        const state = JSON.parse(raw) as { tab?: string; search?: string }
        const params = new URLSearchParams()
        if (state.tab && state.tab !== 'pending') params.set('tab', state.tab)
        if (state.search) params.set('q', state.search)
        const qs = params.toString()
        navigate(qs ? `/admin?${qs}` : '/admin')
        return
      }
    } catch {
      /* ignore */
    }
    navigate('/admin')
  }

  if (!authReady || loading) return <Loader />

  if (!profile) {
    return (
      <AdminPageLayout variant="detail" showBack onBack={handleBack}>
        <Typography color="text.secondary" textAlign="center" py={4}>
          {t('admin.searchNoResults')}
        </Typography>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout variant="detail" showBack onBack={handleBack}>
      {error && (
        <Typography color="error" className="admin-detail-shell__alert">
          {error}
        </Typography>
      )}
      {actionError && (
        <Typography color="error" className="admin-detail-shell__alert">
          {actionError}
        </Typography>
      )}
      <AdminProfileDetailView
        profile={profile}
        allProfiles={profiles}
        mode={viewMode}
        layout="page"
        onModeChange={(mode) => {
          if (mode === 'edit') navigate(`/admin/profile/${profile.id}/edit`)
          else setViewMode('view')
        }}
        onSaved={() => void refetch({ silent: true })}
        onApprove={async (p) => {
          const ok = await approve(p)
          if (ok) handleBack()
          return ok
        }}
        onReject={async (p, notes) => {
          const ok = await reject(p, notes)
          if (ok) handleBack()
          return ok
        }}
        onMerge={async (pending, existing) => {
          const ok = await merge(pending, existing)
          if (ok) handleBack()
          return ok
        }}
        onHide={hide}
        onShow={show}
      />
    </AdminPageLayout>
  )
}
