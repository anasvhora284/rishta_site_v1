import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProfileFormFields from '@/components/profile-form/ProfileFormFields'
import {
  formDataToProfileUpdate,
  profileToFormData,
  validateProfileForm,
} from '@/components/profile-form/profileFormUtils'
import { updateProfile } from '@/hooks/useProfiles'
import type { Profile, ProfileFormData } from '@/types/profile'
import '@/components/profile-form/ProfileFormFields.css'
import '@/pages/Submit/Submit.css'
import '@/pages/Admin/Admin.css'

interface AdminEditProfileDialogProps {
  profile: Profile | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function AdminEditProfileDialog({
  profile,
  open,
  onClose,
  onSaved,
}: AdminEditProfileDialogProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ProfileFormData | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (profile && open) {
      setForm(profileToFormData(profile))
      setErrors({})
      setSaveError('')
    }
  }, [profile, open])

  const update = (field: keyof ProfileFormData, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSave = async () => {
    if (!form || !profile) return
    const validationErrors = validateProfileForm(form, t)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    setSaveError('')
    const { error } = await updateProfile(
      profile.id,
      formDataToProfileUpdate(form, { preserveCityOther: true }),
    )
    setSaving(false)

    if (error) {
      setSaveError(error.message)
      return
    }

    onSaved()
    onClose()
  }

  if (!form || !profile) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      className="admin-edit-dialog"
    >
      <DialogTitle className="admin-dialog-title">
        <EditIcon sx={{ color: 'rgb(174, 0, 61)' }} />
        {t('admin.edit')}
        {profile.profile_id != null && (
          <Typography component="span" variant="body2" color="text.secondary" ml={1}>
            (ID {profile.profile_id})
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers className="admin-edit-dialog__content">
        <ProfileFormFields
          mode="full"
          form={form}
          errors={errors}
          onChange={update}
        />
        {saveError && (
          <Typography color="error" mt={2} textAlign="center">
            {saveError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button
          className="admin-btn admin-btn--edit"
          startIcon={<CloseIcon />}
          onClick={onClose}
          disabled={saving}
        >
          {t('admin.cancel')}
        </Button>
        <Button
          variant="contained"
          className="admin-btn admin-btn--save"
          startIcon={<SaveIcon />}
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {t('admin.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
