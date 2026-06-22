import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import AdminActionBar from '@/components/admin/AdminActionBar'
import AdminDuplicatePanel from '@/components/admin/AdminDuplicatePanel'
import AdminProfileEditForm from '@/components/admin/AdminProfileEditForm'
import AdminReviewCard from '@/components/admin/AdminReviewCard'
import type { Profile } from '@/types/profile'
import { assessDuplicate, hasDuplicateMatches, isMergeTarget, mergeEligibleMatches } from '@/utils/profileDuplicate'

interface AdminProfileDetailViewProps {
  profile: Profile
  allProfiles: Profile[]
  mode: 'view' | 'edit'
  layout: 'drawer' | 'page'
  onModeChange: (mode: 'view' | 'edit') => void
  onSaved: () => void
  onClose?: () => void
  onApprove: (profile: Profile) => Promise<boolean>
  onReject: (profile: Profile, notes: string) => Promise<boolean>
  onMerge: (pending: Profile, existing: Profile) => Promise<boolean>
  onHide: (profile: Profile) => Promise<boolean>
  onShow: (profile: Profile) => Promise<boolean>
}

export default function AdminProfileDetailView({
  profile,
  allProfiles,
  mode,
  layout,
  onModeChange,
  onSaved,
  onApprove,
  onReject,
  onMerge,
  onHide,
  onShow,
}: AdminProfileDetailViewProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [approveConfirmPending, setApproveConfirmPending] = useState(false)

  const assessment = useMemo(
    () => (profile.status === 'pending' ? assessDuplicate(profile, allProfiles) : null),
    [profile, allProfiles],
  )

  useEffect(() => {
    if (!assessment?.matches.length) {
      setSelectedMatchId(null)
      return
    }
    const approved = mergeEligibleMatches(assessment)
    setSelectedMatchId(approved[0]?.profile.id ?? assessment.matches[0].profile.id)
  }, [assessment, profile.id])

  const selectedMatch =
    assessment?.matches.find((m) => m.profile.id === selectedMatchId) ?? assessment?.matches[0] ?? null

  const mergeTarget =
    selectedMatch && isMergeTarget(selectedMatch.profile) ? selectedMatch.profile : null

  const handleApprove = async () => {
    if (profile.status === 'pending' && hasDuplicateMatches(assessment)) {
      setApproveConfirmPending(true)
      return
    }
    const ok = await onApprove(profile)
    if (ok) setApproveConfirmPending(false)
  }

  const handleConfirmApprove = async () => {
    const ok = await onApprove(profile)
    if (ok) setApproveConfirmPending(false)
  }

  const actionBar = (
    <AdminActionBar
      profile={profile}
      assessment={assessment}
      selectedExisting={mergeTarget}
      layout={layout}
      approveConfirmPending={approveConfirmPending}
      onConfirmApprove={() => void handleConfirmApprove()}
      onCancelApproveConfirm={() => setApproveConfirmPending(false)}
      onApprove={() => void handleApprove()}
      onReject={(notes) => void onReject(profile, notes)}
      onMerge={() => {
        if (mergeTarget) void onMerge(profile, mergeTarget)
      }}
      onEdit={() => onModeChange('edit')}
      onHide={() => void onHide(profile)}
      onShow={() => void onShow(profile)}
    />
  )

  if (mode === 'edit') {
    return (
      <Box className={`admin-detail-view admin-detail-view--${layout}`}>
        <Box className="admin-detail-view__card">
          <Box className="admin-detail-view__scroll">
            <AdminProfileEditForm
              profile={profile}
              onCancel={() => onModeChange('view')}
              onSaved={() => {
                onSaved()
                onModeChange('view')
              }}
            />
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box className={`admin-detail-view admin-detail-view--${layout}`}>
      <Box className="admin-detail-view__card">
        <Box className="admin-detail-view__scroll">
          <AdminReviewCard profile={profile} layout={layout} />

          {hasDuplicateMatches(assessment) && assessment && (
            <AdminDuplicatePanel
              candidate={profile}
              assessment={assessment}
              selectedMatchId={selectedMatchId}
              onSelectMatch={setSelectedMatchId}
              layout={layout}
            />
          )}
        </Box>

        <Box className="admin-detail-view__footer">{actionBar}</Box>
      </Box>
    </Box>
  )
}
