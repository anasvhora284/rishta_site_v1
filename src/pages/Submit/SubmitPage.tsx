import { Box, Button, Step, StepLabel, Stepper, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ProfileFormFields from '@/components/profile-form/ProfileFormFields'
import {
  formDataToProfileUpdate,
  validateProfileForm,
} from '@/components/profile-form/profileFormUtils'
import SubmitProfilePreview from '@/components/submit/SubmitProfilePreview'
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
  expectations: '',
}

export default function SubmitPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
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

  const handleGoToPreview = () => {
    if (!validateStep(4)) return
    setSubmitError('')
    setShowPreview(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditFromPreview = () => {
    setShowPreview(false)
    setStep(4)
    setSubmitError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setShowPreview(false)
      setStep(4)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    const { error } = await submitProfile(formDataToProfileUpdate(form))
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

  const handleBack = () => {
    if (showPreview) {
      handleEditFromPreview()
      return
    }
    navigate('/')
  }

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
        <SiteNavbar showBack onBack={handleBack} />
        <Box className="page-content-zone submit-content">
          {showPreview ? (
            <SubmitProfilePreview
              form={form}
              submitting={submitting}
              submitError={submitError}
              onConfirm={() => void handleSubmit()}
              onEdit={handleEditFromPreview}
            />
          ) : (
            <>
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
              />

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
                  <Button variant="contained" onClick={handleGoToPreview} className="step-btn">
                    {t('submit.review')}
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </div>
    </div>
  )
}
