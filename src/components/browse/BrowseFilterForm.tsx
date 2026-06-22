import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCities } from '@/hooks/useCities'
import { useQualifications } from '@/hooks/useQualifications'
import type { BrowseFilterCriteria } from '@/utils/browseFilters'
import {
  buildCityOptions,
  buildMaritalStatusOptions,
  buildQualificationOptions,
} from '@/utils/browseFilters'
import type { Profile } from '@/types/profile'
import { buildLabelMap, localizedName } from '@/utils/localizeReference'
import '@/pages/Browse/Filter.css'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 } },
}

const ageFieldSx = {
  '& .MuiInputBase-root.MuiInput-root:hover::before': { border: 'none' },
  '& .MuiInputBase-root.MuiInput-root::before': { border: 'none' },
  '& .MuiInputBase-root.MuiInput-root::after': { border: 'none' },
}

const selectSx = {
  '& fieldset': { border: '1px solid #d3d3d3' },
  '& .MuiSvgIcon-root': { color: 'rgb(174, 0, 61)' },
}

export interface BrowseFilterFormProps {
  profiles: Profile[]
  criteria: BrowseFilterCriteria
  onCriteriaChange: (criteria: BrowseFilterCriteria) => void
  fromAgeError: string
  toAgeError: string
  onSubmit: () => void
  submitDisabled?: boolean
  submitLabel?: string
  compact?: boolean
}

export default function BrowseFilterForm({
  profiles,
  criteria,
  onCriteriaChange,
  fromAgeError,
  toAgeError,
  onSubmit,
  submitDisabled = false,
  submitLabel,
  compact = false,
}: BrowseFilterFormProps) {
  const { t, i18n } = useTranslation()
  const { cities } = useCities()
  const { qualifications } = useQualifications()
  const cityMap = useMemo(() => buildLabelMap(cities), [cities])
  const qualificationMap = useMemo(() => buildLabelMap(qualifications), [qualifications])
  const { fromAge, toAge, gender, qualification, city, maritalStatus } = criteria

  const cityValues = useMemo(() => buildCityOptions(profiles), [profiles])
  const qualificationValues = useMemo(
    () => (qualifications.length ? qualifications.map((q) => q.code) : buildQualificationOptions()),
    [qualifications],
  )
  const maritalStatusValues = useMemo(() => buildMaritalStatusOptions(profiles), [profiles])

  const patch = (partial: Partial<BrowseFilterCriteria>) => {
    onCriteriaChange({ ...criteria, ...partial })
  }

  const handleFromAgeChange = (value: string) => {
    if (['e', 'E', '-'].some((c) => value.includes(c))) return
    if (/^[0-9]*$/.test(value)) patch({ fromAge: value })
  }

  const handleToAgeChange = (value: string) => {
    if (['e', 'E', '-'].some((c) => value.includes(c))) return
    if (/^[0-9]*$/.test(value)) patch({ toAge: value })
  }

  return (
    <div className={compact ? 'browse-filter-form browse-filter-form--compact' : 'browse-filter-form'}>
      <div className="filter-options-container">
        <div>
          <label className="filter-label">{t('filter.age')}:</label>
          <div className="age-filter-input-wraper">
            <TextField
              value={fromAge}
              onChange={(e) => handleFromAgeChange(e.target.value)}
              variant="standard"
              placeholder={t('filter.from')}
              inputProps={{ maxLength: 3 }}
              sx={ageFieldSx}
              className="age-input-field"
            />
            <span> - </span>
            <TextField
              value={toAge}
              onChange={(e) => handleToAgeChange(e.target.value)}
              variant="standard"
              placeholder={t('filter.to')}
              inputProps={{ maxLength: 3 }}
              sx={ageFieldSx}
              className="age-input-field"
            />
          </div>
          <p className="age-input-error-msg">{fromAgeError || toAgeError}</p>
        </div>

        <div>
          <label className="filter-label">{t('filter.gender')}:</label>
          <RadioGroup
            row
            value={gender}
            onChange={(e) => patch({ gender: e.target.value })}
            className="gender-radio-group"
          >
            <FormControlLabel value="" control={<Radio />} label={t('filter.all')} />
            <FormControlLabel value="female" control={<Radio />} label={t('filter.female')} />
            <FormControlLabel value="male" control={<Radio />} label={t('filter.male')} />
          </RadioGroup>
        </div>

        <div />
        <div className="qualification-wrapper">
          <label className="filter-label">{t('filter.qualification')}:</label>
          <Select
            multiple
            value={qualification}
            onChange={(e) =>
              patch({
                qualification:
                  typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
              })
            }
            input={<OutlinedInput />}
            displayEmpty
            IconComponent={ExpandMoreIcon}
            renderValue={(selected) =>
              selected.length
                ? (selected as string[])
                    .map((code) => localizedName(qualificationMap.get(code), i18n.language, code))
                    .join(', ')
                : t('filter.all')
            }
            MenuProps={MenuProps}
            className="select-dropdown-common"
            sx={selectSx}
          >
            {qualificationValues.map((value) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={qualification.includes(value)} />
                <ListItemText
                  primary={localizedName(qualificationMap.get(value), i18n.language, value)}
                />
              </MenuItem>
            ))}
          </Select>
        </div>

        <div className="city-wrapper">
          <label className="filter-label">{t('filter.city')}:</label>
          <Select
            multiple
            value={city}
            onChange={(e) =>
              patch({
                city: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
              })
            }
            input={<OutlinedInput />}
            displayEmpty
            IconComponent={ExpandMoreIcon}
            renderValue={(selected) =>
              selected.length
                ? (selected as string[])
                    .map((code) => localizedName(cityMap.get(code), i18n.language, code))
                    .join(', ')
                : t('filter.all')
            }
            MenuProps={MenuProps}
            className="select-dropdown-common"
            sx={selectSx}
          >
            {cityValues.map((value) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={city.includes(value)} />
                <ListItemText
                  primary={localizedName(cityMap.get(value), i18n.language, value)}
                />
              </MenuItem>
            ))}
          </Select>
        </div>

        <div className="marital-wrapper">
          <label className="filter-label">{t('filter.maritalStatus')}:</label>
          <Select
            multiple
            value={maritalStatus}
            onChange={(e) =>
              patch({
                maritalStatus:
                  typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
              })
            }
            input={<OutlinedInput />}
            displayEmpty
            IconComponent={ExpandMoreIcon}
            renderValue={(selected) =>
              selected.length ? selected.map((v) => t(`marital.${v}`)).join(', ') : t('filter.all')
            }
            MenuProps={MenuProps}
            className="select-dropdown-common"
            sx={selectSx}
          >
            {maritalStatusValues.map((value) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={maritalStatus.includes(value)} />
                <ListItemText primary={t(`marital.${value}`)} />
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      {!compact && <p className="submit-notice-msg">{t('filter.waitNotice')}</p>}
      <Box className="submit-btn-box">
        <Button
          variant="contained"
          fullWidth
          disabled={submitDisabled || !!fromAgeError || !!toAgeError}
          onClick={onSubmit}
          sx={{ backgroundColor: '#ae003d' }}
        >
          {submitLabel ?? t('filter.submit')}
        </Button>
      </Box>
    </div>
  )
}
