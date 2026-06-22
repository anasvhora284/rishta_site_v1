import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import EditIcon from '@mui/icons-material/Edit'
import MergeIcon from '@mui/icons-material/MergeType'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { Box, Button, Collapse, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isHiddenFromBrowseProfile } from '@/hooks/useProfiles'
import type { Profile } from '@/types/profile'
import { hasDuplicateMatches, type DuplicateAssessment } from '@/utils/profileDuplicate'

interface AdminActionBarProps {
  profile: Profile
  assessment: DuplicateAssessment | null
  selectedExisting: Profile | null
  layout: 'drawer' | 'page'
  onApprove: () => void
  onReject: (notes: string) => void
  onMerge: () => void
  onEdit: () => void
  onHide: () => void
  onShow: () => void
  approveConfirmPending?: boolean
  onConfirmApprove?: () => void
  onCancelApproveConfirm?: () => void
}

export default function AdminActionBar({
  profile,
  assessment,
  selectedExisting,
  layout,
  onApprove,
  onReject,
  onMerge,
  onEdit,
  onHide,
  onShow,
  approveConfirmPending,
  onConfirmApprove,
  onCancelApproveConfirm,
}: AdminActionBarProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const hidden = isHiddenFromBrowseProfile(profile)
  const isPending = profile.status === 'pending'
  const showMerge = Boolean(selectedExisting && hasDuplicateMatches(assessment))

  const handleReject = () => {
    onReject(rejectNotes)
    setRejectNotes('')
    setRejectOpen(false)
  }

  const useShortLabels = isMobile || layout === 'drawer'
  const mergeLabel = isMobile ? t('admin.mergeTiny') : useShortLabels ? t('admin.mergeShort') : t('admin.updateExistingAndReject')
  const approveLabel = useShortLabels ? t('admin.approveShort') : t('admin.approve')
  const rejectLabel = useShortLabels ? t('admin.rejectShort') : t('admin.reject')
  const editLabel = useShortLabels ? t('admin.editShort') : t('admin.edit')

  return (
    <Box className={`admin-action-bar admin-action-bar--${layout}`}>
      <Collapse in={!!approveConfirmPending} unmountOnExit>
        <Box className="admin-action-bar__confirm">
          <Typography variant="body2" className="admin-action-bar__confirm-text">
            {t('admin.approveDespiteDuplicate')}
          </Typography>
          <Box className="admin-action-bar__confirm-actions">
            <Button size="small" onClick={onCancelApproveConfirm}>
              {t('admin.cancel')}
            </Button>
            <Button size="small" variant="contained" className="admin-btn admin-btn--approve" onClick={onConfirmApprove}>
              {t('admin.approveShort')}
            </Button>
          </Box>
        </Box>
      </Collapse>

      <Collapse in={rejectOpen && isPending} unmountOnExit>
        <Box className="admin-action-bar__reject">
          <TextField
            fullWidth
            multiline
            minRows={isMobile ? 1 : 2}
            size="small"
            label={t('admin.rejectReason')}
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
          />
          <Box className="admin-action-bar__reject-actions">
            <Button size="small" onClick={() => setRejectOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button size="small" variant="contained" className="admin-btn admin-btn--reject" onClick={handleReject}>
              {t('admin.rejectShort')}
            </Button>
          </Box>
        </Box>
      </Collapse>

      <Box className="admin-action-bar__primary">
        {isPending && (
          <>
            <Button
              variant="outlined"
              size="small"
              className="admin-btn admin-btn--reject admin-action-bar__btn--reject"
              startIcon={<CancelIcon />}
              onClick={() => setRejectOpen((v) => !v)}
            >
              {rejectLabel}
            </Button>
            <Button
              variant="contained"
              size="small"
              className="admin-btn admin-btn--approve admin-action-bar__btn--approve"
              startIcon={<CheckCircleIcon />}
              onClick={onApprove}
            >
              {approveLabel}
            </Button>
            {showMerge && (
              <Button
                variant="outlined"
                size="small"
                className="admin-btn admin-btn--merge admin-action-bar__btn--merge"
                startIcon={<MergeIcon />}
                onClick={onMerge}
              >
                {mergeLabel}
              </Button>
            )}
          </>
        )}

        <Button
          variant="outlined"
          size="small"
          className="admin-btn admin-action-bar__btn--edit"
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          {editLabel}
        </Button>

        {profile.status === 'approved' && !hidden && (
          <Button
            variant="outlined"
            size="small"
            className="admin-btn admin-action-bar__btn--hide"
            startIcon={<VisibilityOffIcon />}
            onClick={onHide}
          >
            {useShortLabels ? t('admin.hideShort') : t('admin.hideFromBrowse')}
          </Button>
        )}

        {hidden && (
          <Button
            variant="contained"
            size="small"
            className="admin-btn admin-btn--approve admin-action-bar__btn--show"
            startIcon={<VisibilityIcon />}
            onClick={onShow}
          >
            {useShortLabels ? t('admin.showShort') : t('admin.showOnBrowse')}
          </Button>
        )}
      </Box>
    </Box>
  )
}
