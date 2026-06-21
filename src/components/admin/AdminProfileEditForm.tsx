import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Typography } from '@mui/material'
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

interface AdminProfileEditFormProps {
  profile: Profile
  onCancel: () => void
  onSaved: () => void
}

export default function AdminProfileEditForm({ profile, onCancel, onSaved }: AdminProfileEditFormProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ProfileFormData>(() => profileToFormData(profile))
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    setForm(profileToFormData(profile))
    setErrors({})
    setSaveError('')
  }, [profile])

  const update = (field: keyof ProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSave = async () => {
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
  }

  return (
    <Box className="admin-edit-form">
      <ProfileFormFields mode="full" form={form} errors={errors} onChange={update} />
      {saveError && (
        <Typography color="error" mt={2} textAlign="center">
          {saveError}
        </Typography>
      )}
      <Box className="admin-edit-form__actions">
        <Button startIcon={<CloseIcon />} onClick={onCancel} disabled={saving}>
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
      </Box>
    </Box>
  )
}
