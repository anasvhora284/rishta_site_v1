import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cityOptions, useCities } from '@/hooks/useCities'
import { useQualifications } from '@/hooks/useQualifications'
import { useSubCasts, subCastOptions } from '@/hooks/useSubCasts'
import { type ProfileFormData } from '@/types/profile'
import { CANONICAL_QUALIFICATIONS } from '@/data/canonical-qualifications'
import { formatIndianMobileInput } from '@/utils/phoneValidation'
import { localizedName, sortLocalizedRecords } from '@/utils/localizeReference'
import { isOtherCity } from '@/data/canonical-cities'
import BilingualField from './BilingualField'
import { maxDateOfBirthForMinAge } from './profileFormUtils'

export type ProfileFormStep = 0 | 1 | 2 | 3 | 4

interface ProfileFormFieldsProps {
  form: ProfileFormData
  errors: Partial<Record<keyof ProfileFormData, string>>
  onChange: (field: keyof ProfileFormData, value: string) => void
  /** Wizard: one step. Admin dialog: all sections. */
  mode: 'step' | 'full'
  activeStep?: ProfileFormStep
  showReviewSummary?: boolean
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography className="profile-form-section-title" variant="subtitle1">
      {children}
    </Typography>
  )
}

export default function ProfileFormFields({
  form,
  errors,
  onChange,
  mode,
  activeStep = 0,
  showReviewSummary = false,
}: ProfileFormFieldsProps) {
  const { t, i18n } = useTranslation()
  const { cities, loading: citiesLoading } = useCities()
  const { qualifications, loading: qualificationsLoading } = useQualifications()
  const { subCasts, loading: subCastsLoading } = useSubCasts()
  const cityChoices = useMemo(
    () => sortLocalizedRecords(cityOptions(form.city, cities), i18n.language),
    [form.city, cities, i18n.language],
  )
  const subCastChoices = useMemo(
    () => sortLocalizedRecords(subCastOptions(form.sub_cast, subCasts), i18n.language),
    [form.sub_cast, subCasts, i18n.language],
  )
  const qualificationChoices =
    qualifications.length > 0
      ? qualifications
      : CANONICAL_QUALIFICATIONS.map((q) => ({
          code: q.value,
          name_en: q.nameEn,
          name_gu: q.nameGu,
        }))

  const show = (step: ProfileFormStep) => mode === 'full' || activeStep === step

  return (
    <Box className="profile-form-fields">
      {show(0) && (
        <Box className="profile-form-section">
          {mode === 'full' && <SectionTitle>{t('submit.step1')}</SectionTitle>}
          <BilingualField labelKey="form.name.label" hintKey="form.name.hint">
            <TextField
              fullWidth
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </BilingualField>
          <BilingualField labelKey="form.gender.label" hintKey="form.gender.hint">
            <RadioGroup row value={form.gender} onChange={(e) => onChange('gender', e.target.value)}>
              <FormControlLabel value="male" control={<Radio />} label={t('filter.male')} />
              <FormControlLabel value="female" control={<Radio />} label={t('filter.female')} />
            </RadioGroup>
            {errors.gender && (
              <Typography color="error" fontSize="0.85rem">
                {errors.gender}
              </Typography>
            )}
          </BilingualField>
          <BilingualField labelKey="form.dob.label" hintKey="form.dob.hint">
            <TextField
              fullWidth
              type="date"
              value={form.date_of_birth}
              onChange={(e) => onChange('date_of_birth', e.target.value)}
              inputProps={{ max: maxDateOfBirthForMinAge() }}
              InputLabelProps={{ shrink: true }}
              error={!!errors.date_of_birth}
              helperText={errors.date_of_birth}
            />
          </BilingualField>
        </Box>
      )}

      {show(1) && (
        <Box className="profile-form-section">
          {mode === 'full' && <SectionTitle>{t('submit.step2')}</SectionTitle>}
          <BilingualField labelKey="form.qualification.label" hintKey="form.qualification.hint">
            <FormControl fullWidth error={!!errors.qualification}>
              <InputLabel>{t('form.qualification.label')}</InputLabel>
              <Select
                value={form.qualification}
                label={t('form.qualification.label')}
                onChange={(e) => onChange('qualification', e.target.value)}
                disabled={qualificationsLoading && qualificationChoices.length === 0}
                renderValue={(value) => {
                  if (value === 'Other' && form.qualification_other.trim()) {
                    return `Other (${form.qualification_other.trim()})`
                  }
                  const match = qualificationChoices.find((q) => q.code === value)
                  return match ? localizedName(match, i18n.language) : value
                }}
              >
                {qualificationChoices.map((q) => (
                  <MenuItem key={q.code} value={q.code}>
                    {localizedName(q, i18n.language)}
                  </MenuItem>
                ))}
              </Select>
              {errors.qualification && (
                <Typography color="error" fontSize="0.85rem">
                  {errors.qualification}
                </Typography>
              )}
            </FormControl>
          </BilingualField>
          {form.qualification === 'Other' && (
            <BilingualField labelKey="form.qualificationOther.label" hintKey="form.qualificationOther.hint">
              <TextField
                fullWidth
                value={form.qualification_other}
                onChange={(e) => onChange('qualification_other', e.target.value)}
                error={!!errors.qualification_other}
                helperText={errors.qualification_other}
              />
            </BilingualField>
          )}
          <BilingualField labelKey="form.currentProfile.label" hintKey="form.currentProfile.hint">
            <TextField
              fullWidth
              multiline
              rows={2}
              value={form.current_profile}
              onChange={(e) => onChange('current_profile', e.target.value)}
              error={!!errors.current_profile}
              helperText={errors.current_profile}
            />
          </BilingualField>
          <BilingualField labelKey="form.expectations.label" hintKey="form.expectations.hint">
            <TextField
              fullWidth
              multiline
              rows={3}
              value={form.expectations}
              onChange={(e) => onChange('expectations', e.target.value)}
              error={!!errors.expectations}
              helperText={errors.expectations}
            />
          </BilingualField>
        </Box>
      )}

      {show(2) && (
        <Box className="profile-form-section">
          {mode === 'full' && <SectionTitle>{t('submit.step3')}</SectionTitle>}
          <BilingualField labelKey="form.fatherName.label" hintKey="form.fatherName.hint">
            <TextField
              fullWidth
              value={form.father_name}
              onChange={(e) => onChange('father_name', e.target.value)}
              error={!!errors.father_name}
              helperText={errors.father_name}
            />
          </BilingualField>
          <BilingualField labelKey="form.fatherOccupation.label" hintKey="form.fatherOccupation.hint">
            <TextField
              fullWidth
              value={form.father_occupation}
              onChange={(e) => onChange('father_occupation', e.target.value)}
              error={!!errors.father_occupation}
              helperText={errors.father_occupation}
            />
          </BilingualField>
          <BilingualField labelKey="form.motherName.label" hintKey="form.motherName.hint">
            <TextField
              fullWidth
              value={form.mother_name}
              onChange={(e) => onChange('mother_name', e.target.value)}
              error={!!errors.mother_name}
              helperText={errors.mother_name}
            />
          </BilingualField>
        </Box>
      )}

      {show(3) && (
        <Box className="profile-form-section">
          {mode === 'full' && <SectionTitle>{t('submit.step4')}</SectionTitle>}
          <BilingualField labelKey="form.city.label" hintKey="form.city.hint">
            <FormControl fullWidth error={!!errors.city}>
              <InputLabel>{t('form.city.label')}</InputLabel>
              <Select
                value={form.city}
                label={t('form.city.label')}
                onChange={(e) => onChange('city', e.target.value)}
                disabled={citiesLoading && cityChoices.length === 0}
                MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
              >
                {cityChoices.map((city) => (
                  <MenuItem key={city.code} value={city.code}>
                    {localizedName(city, i18n.language)}
                  </MenuItem>
                ))}
              </Select>
              {errors.city && (
                <Typography color="error" fontSize="0.85rem">
                  {errors.city}
                </Typography>
              )}
            </FormControl>
          </BilingualField>
          {isOtherCity(form.city) && (
            <BilingualField labelKey="form.cityOther.label" hintKey="form.cityOther.hint">
              <TextField
                fullWidth
                value={form.city_other}
                onChange={(e) => onChange('city_other', e.target.value)}
                error={!!errors.city_other}
                helperText={errors.city_other}
              />
            </BilingualField>
          )}
          <BilingualField labelKey="form.subCast.label" hintKey="form.subCast.hint">
            <FormControl fullWidth error={!!errors.sub_cast}>
              <InputLabel>{t('form.subCast.label')}</InputLabel>
              <Select
                value={form.sub_cast}
                label={t('form.subCast.label')}
                onChange={(e) => onChange('sub_cast', e.target.value)}
                disabled={subCastsLoading && subCastChoices.length === 0}
                MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
              >
                {subCastChoices.map((cast) => (
                  <MenuItem key={cast.code} value={cast.code}>
                    {localizedName(cast, i18n.language)}
                  </MenuItem>
                ))}
              </Select>
              {errors.sub_cast && (
                <Typography color="error" fontSize="0.85rem">
                  {errors.sub_cast}
                </Typography>
              )}
            </FormControl>
          </BilingualField>
          <BilingualField labelKey="form.maritalStatus.label" hintKey="form.maritalStatus.hint">
            <RadioGroup
              value={form.marital_status}
              onChange={(e) => onChange('marital_status', e.target.value)}
            >
              <FormControlLabel value="unmarried" control={<Radio />} label={t('marital.unmarried')} />
              <FormControlLabel value="divorce" control={<Radio />} label={t('marital.divorce')} />
              <FormControlLabel value="widowed" control={<Radio />} label={t('marital.widowed')} />
            </RadioGroup>
            {errors.marital_status && (
              <Typography color="error" fontSize="0.85rem">
                {errors.marital_status}
              </Typography>
            )}
          </BilingualField>
        </Box>
      )}

      {show(4) && (
        <Box className="profile-form-section">
          {mode === 'full' && <SectionTitle>{t('submit.step5')}</SectionTitle>}
          <BilingualField labelKey="form.height.label" hintKey="form.height.hint">
            <TextField
              fullWidth
              value={form.height}
              onChange={(e) => onChange('height', e.target.value)}
              placeholder={'5\'2"'}
              error={!!errors.height}
              helperText={errors.height}
            />
          </BilingualField>
          <BilingualField labelKey="form.weight.label" hintKey="form.weight.hint">
            <TextField
              fullWidth
              multiline
              rows={2}
              value={form.weight_other}
              onChange={(e) => onChange('weight_other', e.target.value)}
              error={!!errors.weight_other}
              helperText={errors.weight_other}
            />
          </BilingualField>
          <BilingualField labelKey="form.contact.label" hintKey="form.contact.hint">
            <TextField
              fullWidth
              type="tel"
              value={form.parent_contact}
              onChange={(e) => onChange('parent_contact', formatIndianMobileInput(e.target.value))}
              inputProps={{ inputMode: 'numeric', maxLength: 10, pattern: '[0-9]*' }}
              placeholder="9876543210"
              error={!!errors.parent_contact}
              helperText={errors.parent_contact}
            />
          </BilingualField>

          {showReviewSummary && mode === 'step' && (
            <Box className="review-summary" mt={2}>
              <Typography fontWeight={700} mb={1}>
                {t('submit.review')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('form.name.label')}:</strong> {form.name}
              </Typography>
              <Typography variant="body2">
                <strong>{t('form.gender.label')}:</strong>{' '}
                {form.gender === 'male' ? t('filter.male') : t('filter.female')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('form.city.label')}:</strong>{' '}
                {isOtherCity(form.city) ? form.city_other : form.city}
              </Typography>
              <Typography variant="body2">
                <strong>{t('form.contact.label')}:</strong> {form.parent_contact}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
