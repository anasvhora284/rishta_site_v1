import { Typography, useMediaQuery, useTheme } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AdminPageLayout from '@/components/admin/AdminPageLayout'
import AdminProfileDrawer from '@/components/admin/AdminProfileDrawer'
import AdminProfileListDesktop from '@/components/admin/AdminProfileListDesktop'
import AdminProfileListMobile from '@/components/admin/AdminProfileListMobile'
import AdminShell from '@/components/admin/AdminShell'
import type { AdminTab } from '@/components/admin/adminTypes'
import Loader from '@/components/Loader'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAdminProfileActions } from '@/hooks/useAdminProfileActions'
import { useAdminProfiles } from '@/hooks/useAdminProfiles'
import { isHiddenFromBrowseProfile } from '@/hooks/useProfiles'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/profile'
import { buildDuplicateById, filterAdminProfiles } from '@/utils/adminListFilter'
import '@/pages/Admin/Admin.css'

const LIST_STATE_KEY = 'admin-list-state'

function parseTab(value: string | null): AdminTab {
  if (value === 'approved' || value === 'rejected' || value === 'all') return value
  return 'pending'
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchParams, setSearchParams] = useSearchParams()

  const { userId, authReady } = useAdminAuth()
  const { profiles, loading, error, refetch, removeProfileLocally, patchProfileLocally } =
    useAdminProfiles(authReady)

  const tab = parseTab(searchParams.get('tab'))
  const search = searchParams.get('q') ?? ''
  const selectedProfileId = searchParams.get('profile')
  const drawerEditMode = searchParams.get('mode') === 'edit'

  const [drawerOpen, setDrawerOpen] = useState(false)

  const { actionError, approve, reject, merge, hide, show } = useAdminProfileActions({
    userId,
    onRefetch: () => void refetch({ silent: true }),
    removeProfileLocally,
    patchProfileLocally,
  })

  useEffect(() => {
    sessionStorage.setItem(
      LIST_STATE_KEY,
      JSON.stringify({ tab, search }),
    )
  }, [tab, search])

  const stats = useMemo(() => {
    const pending = profiles.filter((p) => p.status === 'pending').length
    const approved = profiles.filter((p) => p.status === 'approved').length
    const rejected = profiles.filter((p) => p.status === 'rejected').length
    const hidden = profiles.filter((p) => isHiddenFromBrowseProfile(p)).length
    return { pending, approved, rejected, hidden }
  }, [profiles])

  const duplicateById = useMemo(() => buildDuplicateById(profiles), [profiles])

  const filteredProfiles = useMemo(
    () => filterAdminProfiles(profiles, tab, search),
    [profiles, tab, search],
  )

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  )

  useEffect(() => {
    if (!isMobile && selectedProfileId && selectedProfile) {
      setDrawerOpen(true)
    } else {
      setDrawerOpen(false)
    }
  }, [isMobile, selectedProfileId, selectedProfile])

  const patchParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === '') next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  const handleSelectProfile = (profile: Profile) => {
    if (isMobile) {
      navigate(`/admin/profile/${profile.id}`)
      return
    }
    patchParams({ profile: profile.id, mode: null })
  }

  const closeDrawer = () => {
    patchParams({ profile: null, mode: null })
    setDrawerOpen(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (!authReady) return <Loader />

  return (
    <AdminPageLayout showBack onBack={() => navigate('/')}>
      <AdminShell
        tab={tab}
        onTabChange={(v) => patchParams({ tab: v === 'pending' ? null : v })}
        search={search}
        onSearchChange={(v) => patchParams({ q: v || null })}
        stats={stats}
        resultCount={filteredProfiles.length}
        error={error}
        actionError={actionError}
        onSignOut={() => void handleSignOut()}
      >
        {loading ? (
          <Loader variant="inline" />
        ) : !filteredProfiles.length ? (
          <Typography color="text.secondary" textAlign="center" className="admin-empty">
            {search.trim() ? t('admin.searchNoResults') : t('admin.noProfiles')}
          </Typography>
        ) : isMobile ? (
          <AdminProfileListMobile
            profiles={filteredProfiles}
            duplicateById={duplicateById}
            onSelect={handleSelectProfile}
          />
        ) : (
          <AdminProfileListDesktop
            profiles={filteredProfiles}
            duplicateById={duplicateById}
            selectedId={selectedProfileId}
            onSelect={handleSelectProfile}
          />
        )}
      </AdminShell>

      {!isMobile && (
        <AdminProfileDrawer
          profile={selectedProfile}
          allProfiles={profiles}
          open={drawerOpen && !!selectedProfile}
          onClose={closeDrawer}
          onRefetch={() => void refetch({ silent: true })}
          initialMode={drawerEditMode ? 'edit' : 'view'}
          onApprove={approve}
          onReject={reject}
          onMerge={merge}
          onHide={hide}
          onShow={show}
        />
      )}
    </AdminPageLayout>
  )
}
