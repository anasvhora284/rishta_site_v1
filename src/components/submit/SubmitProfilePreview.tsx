import EditIcon from '@mui/icons-material/Edit'
import SendIcon from '@mui/icons-material/Send'
import { Box, Button, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ProfileCard from '@/components/ProfileCard'
import { formDataToPreviewProfile } from '@/components/profile-form/profileFormUtils'
import type { ProfileFormData } from '@/types/profile'

interface SubmitProfilePreviewProps {
  form: ProfileFormData
  submitting: boolean
  submitError: string
  onConfirm: () => void
  onEdit: () => void
}

export default function SubmitProfilePreview({
  form,
  submitting,
  submitError,
  onConfirm,
  onEdit,
}: SubmitProfilePreviewProps) {
  const { t } = useTranslation()
  const previewProfile = useMemo(() => formDataToPreviewProfile(form), [form])

  return (
    <Box className="submit-preview">
      <Typography variant="h5" fontWeight={700} textAlign="center" mb={1} color="#ae003d">
        {t('submit.previewTitle')}
      </Typography>
      <Typography className="submit-preview__subtitle" textAlign="center" mb={3}>
        {t('submit.previewSubtitle')}
      </Typography>

      <Box className="submit-preview__frame">
        <ProfileCard profile={previewProfile} />
      </Box>

      {submitError && (
        <Typography color="error" textAlign="center" mt={2}>
          {submitError}
        </Typography>
      )}

      <Box className="step-actions submit-preview__actions">
        <Button
          variant="outlined"
          className="step-btn"
          startIcon={<EditIcon />}
          onClick={onEdit}
          disabled={submitting}
        >
          {t('submit.editDetails')}
        </Button>
        <Button
          variant="contained"
          className="step-btn"
          startIcon={<SendIcon />}
          onClick={onConfirm}
          disabled={submitting}
        >
          {submitting ? t('submit.submitting') : t('submit.confirmSubmit')}
        </Button>
      </Box>
    </Box>
  )
}
