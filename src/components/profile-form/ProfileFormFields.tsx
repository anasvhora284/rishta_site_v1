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
import { useTranslation } from 'react-i18next'
import { CITIES, QUALIFICATIONS, type ProfileFormData } from '@/types/profile'
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
  const { t } = useTranslation()

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
              >
                {QUALIFICATIONS.map((q) => (
                  <MenuItem key={q} value={q}>
                    {q}
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
              >
                {CITIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
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
          {form.city === 'Other' && (
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
            <TextField
              fullWidth
              value={form.sub_cast}
              onChange={(e) => onChange('sub_cast', e.target.value)}
              error={!!errors.sub_cast}
              helperText={errors.sub_cast}
            />
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
              onChange={(e) => onChange('parent_contact', e.target.value)}
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
                {form.city === 'Other' ? form.city_other : form.city}
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
