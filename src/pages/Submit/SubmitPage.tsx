import { Box, Button, Step, StepLabel, Stepper, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ProfileFormFields from '@/components/profile-form/ProfileFormFields'
import { validateProfileForm } from '@/components/profile-form/profileFormUtils'
import '@/components/profile-form/ProfileFormFields.css'
import SiteNavbar from '@/components/SiteNavbar'
import TeamSection from '@/components/TeamSection'
import '@/pages/Browse/Filter.css'
import { submitProfile } from '@/hooks/useProfiles'
import type { ProfileFormData } from '@/types/profile'
import './Submit.css'

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const

const emptyForm: ProfileFormData = {
  name: '',
  gender: '',
  qualification: '',
  qualification_other: '',
  current_profile: '',
  father_name: '',
  father_occupation: '',
  mother_name: '',
  city: '',
  city_other: '',
  date_of_birth: '',
  marital_status: '',
  height: '',
  weight_other: '',
  parent_contact: '',
  sub_cast: '',
}

export default function SubmitPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ProfileFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const update = (field: keyof ProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validateStep = (s: number): boolean => {
    const e = validateProfileForm(form, t, { step: s })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    setSubmitting(true)
    setSubmitError('')
    const { error } = await submitProfile({
      name: form.name.trim(),
      gender: form.gender as 'male' | 'female',
      qualification: form.qualification,
      qualification_other: form.qualification === 'Other' ? form.qualification_other.trim() : null,
      current_profile: form.current_profile.trim(),
      father_name: form.father_name.trim(),
      father_occupation: form.father_occupation.trim(),
      mother_name: form.mother_name.trim(),
      city: form.city,
      city_other: form.city === 'Other' ? form.city_other.trim() : null,
      date_of_birth: form.date_of_birth,
      marital_status: form.marital_status as 'unmarried' | 'divorce' | 'widowed',
      height: form.height.trim(),
      weight_other: form.weight_other.trim(),
      parent_contact: form.parent_contact.trim(),
      sub_cast: form.sub_cast.trim(),
    })
    setSubmitting(false)
    if (error) {
      setSubmitError(error.message)
    } else {
      setSubmitted(true)
    }
  }

  useEffect(() => {
    document.body.style.background = '#DBE3F0'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  if (submitted) {
    return (
      <div className="FilterPageMainDiv">
        <div className="filter-page-container">
          <SiteNavbar showBack onBack={() => navigate('/')} />
          <Box className="page-content-zone success-box">
            <Typography variant="h5" fontWeight={700} color="#ae003d" mb={2}>
              {t('submit.successTitle')}
            </Typography>
            <Typography mb={3}>{t('submit.successMessage')}</Typography>
            <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2, backgroundColor: '#ae003d' }}>
              {t('nav.home')}
            </Button>
          </Box>
          <TeamSection />
        </div>
      </div>
    )
  }

  return (
    <div className="FilterPageMainDiv">
      <div className="filter-page-container">
        <SiteNavbar showBack onBack={() => navigate('/')} />
        <Box className="page-content-zone submit-content">
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={3} color="#ae003d">
            {t('submit.title')}
          </Typography>

          <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((s) => (
              <Step key={s}>
                <StepLabel>{t(`submit.${s}`)}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <ProfileFormFields
            mode="step"
            activeStep={step as 0 | 1 | 2 | 3 | 4}
            form={form}
            errors={errors}
            onChange={update}
            showReviewSummary={step === 4}
          />

          {submitError && (
            <Typography color="error" textAlign="center" mt={2}>
              {submitError}
            </Typography>
          )}

          <Box className="step-actions">
            {step > 0 && (
              <Button variant="outlined" onClick={() => setStep((s) => s - 1)} className="step-btn">
                {t('submit.back')}
              </Button>
            )}
            {step < 4 ? (
              <Button variant="contained" onClick={handleNext} className="step-btn">
                {t('submit.next')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="step-btn"
              >
                {t('submit.review')}
              </Button>
            )}
          </Box>
        </Box>
      </div>
    </div>
  )
}
