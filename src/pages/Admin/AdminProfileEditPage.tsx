import { Box, Typography } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import AdminPageLayout from '@/components/admin/AdminPageLayout'
import AdminProfileEditForm from '@/components/admin/AdminProfileEditForm'
import Loader from '@/components/Loader'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAdminProfiles } from '@/hooks/useAdminProfiles'
import '@/pages/Admin/Admin.css'

export default function AdminProfileEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { authReady } = useAdminAuth()
  const { profiles, loading, refetch } = useAdminProfiles(authReady)

  const profile = useMemo(() => profiles.find((p) => p.id === id) ?? null, [profiles, id])

  useEffect(() => {
    if (window.matchMedia('(min-width: 900px)').matches && id) {
      navigate(`/admin?profile=${id}&mode=edit`, { replace: true })
    }
  }, [id, navigate])

  const handleBack = () => {
    navigate(`/admin/profile/${id}`)
  }

  if (!authReady || loading) return <Loader />

  if (!profile) {
    return (
      <AdminPageLayout variant="detail" showBack onBack={() => navigate('/admin')}>
        <Typography color="text.secondary" textAlign="center" py={4}>
          {t('admin.searchNoResults')}
        </Typography>
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout variant="detail" showBack onBack={handleBack}>
      <Box className="admin-detail-view admin-detail-view--page">
        <Box className="admin-detail-view__card">
          <Box className="admin-detail-view__scroll">
            <Typography className="admin-detail-page__title">{t('admin.edit')}</Typography>
            <AdminProfileEditForm
          profile={profile}
          onCancel={handleBack}
          onSaved={() => {
            void refetch({ silent: true })
            handleBack()
          }}
            />
          </Box>
        </Box>
      </Box>
    </AdminPageLayout>
  )
}
