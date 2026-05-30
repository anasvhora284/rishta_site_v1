import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Alert,
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
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Loader from '@/components/Loader'
import SiteNavbar from '@/components/SiteNavbar'
import TeamSection from '@/components/TeamSection'
import { setFilteredData } from '@/duck/slice'
import { isPublicBrowseProfile, useProfiles } from '@/hooks/useProfiles'
import type { Profile } from '@/types/profile'
import { calculateAge, normalizeCity } from '@/utils'
import './Filter.css'

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

export default function FilterPage() {
  const { t } = useTranslation()
  const { profiles, loading, error } = useProfiles('approved', true, { publicBrowseOnly: true })
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [fromAge, setFromAge] = useState('')
  const [toAge, setToAge] = useState('')
  const [fromAgeError, setFromAgeError] = useState('')
  const [toAgeError, setToAgeError] = useState('')
  const [qualification, setQualification] = useState<string[]>([])
  const [city, setCity] = useState<string[]>([])
  const [maritalStatus, setMaritalStatus] = useState<string[]>([])
  const [gender, setGender] = useState('')

  const cityValues = useMemo(() => {
    const cities = profiles
      .map((p) => normalizeCity(p.city === 'Other' ? (p.city_other ?? p.city) : p.city))
      .filter(Boolean)
    return [...new Set(cities)].sort()
  }, [profiles])

  const qualificationValues = useMemo(() => {
    const quals = profiles
      .map((p) => (p.education_category ?? p.qualification).trim())
      .filter(Boolean)
    const unique = [...new Set(quals)]
    const special = ['10th', '12th'].filter((q) => unique.includes(q))
    const rest = unique.filter((q) => !special.includes(q)).sort()
    return [...special, ...rest]
  }, [profiles])

  const maritalStatusValues = useMemo(() => {
    const statuses = profiles.map((p) => p.marital_status).filter(Boolean)
    return [...new Set(statuses)].sort()
  }, [profiles])

  useEffect(() => {
    document.body.style.background = '#DBE3F0'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  const validateAge = (from: string, to: string) => {
    setFromAgeError('')
    setToAgeError('')
    if (from && Number(from) <= 0) { setFromAgeError(t('filter.fromAgeError')); return false }
    if (from && Number(from) > 100) { setFromAgeError(t('filter.toAgeError')); return false }
    if (to && Number(to) <= 0) { setToAgeError(t('filter.fromAgeError')); return false }
    if (to && Number(to) > 100) { setToAgeError(t('filter.toAgeError')); return false }
    if (from && to && Number(to) < Number(from)) { setToAgeError(t('filter.ageRangeError')); return false }
    return true
  }

  const handleFromAgeChange = (value: string) => {
    if (['e', 'E', '-'].some((c) => value.includes(c))) return
    if (/^[0-9]*$/.test(value)) {
      setFromAge(value)
      validateAge(value, toAge)
    }
  }

  const handleToAgeChange = (value: string) => {
    if (['e', 'E', '-'].some((c) => value.includes(c))) return
    if (/^[0-9]*$/.test(value)) {
      setToAge(value)
      validateAge(fromAge, value)
    }
  }

  const handleSubmit = () => {
    if (!validateAge(fromAge, toAge)) return

    const outputData = profiles.filter((data: Profile) => {
      if (!isPublicBrowseProfile(data)) return false
      const dobStr = data.date_of_birth.replace(/-/g, '/')
      const userAge = calculateAge(dobStr)

      if ((fromAge && userAge < parseInt(fromAge)) || (toAge && userAge > parseInt(toAge))) {
        return false
      }

      const profileCity = normalizeCity(data.city === 'Other' ? (data.city_other ?? data.city) : data.city)
      const eduCat = (data.education_category ?? data.qualification).trim()

      return (
        (!qualification.length || qualification.includes(eduCat)) &&
        (!gender || data.gender === gender) &&
        (!city.length || city.includes(profileCity)) &&
        (!maritalStatus.length || maritalStatus.includes(data.marital_status))
      )
    })

    dispatch(setFilteredData(outputData))
    navigate('/userlist')
  }

  if (loading) return <Loader />

  return (
    <div className="FilterPageMainDiv">
      <div className="filter-page-container">
        <SiteNavbar showBack onBack={() => navigate('/')} />

        {error && (
          <div className="container alert-msg">
            <Alert variant="filled" severity="error">{t('filter.error')}</Alert>
          </div>
        )}

        <div className="filter-box-wrapper container">
          <div id="filter-box-wrapper">
            <div className="filter-box-container">
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
                  <RadioGroup row value={gender} onChange={(e) => setGender(e.target.value)} className="gender-radio-group">
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
                    onChange={(e) => setQualification(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    input={<OutlinedInput />}
                    displayEmpty
                    IconComponent={ExpandMoreIcon}
                    renderValue={(selected) => (selected.length ? selected.map((v) => v.toUpperCase()).join(', ') : t('filter.all'))}
                    MenuProps={MenuProps}
                    className="select-dropdown-common"
                    sx={selectSx}
                  >
                    {qualificationValues.map((value) => (
                      <MenuItem key={value} value={value}>
                        <Checkbox checked={qualification.includes(value)} />
                        <ListItemText primary={value.toUpperCase()} />
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <div className="city-wrapper">
                  <label className="filter-label">{t('filter.city')}:</label>
                  <Select
                    multiple
                    value={city}
                    onChange={(e) => setCity(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    input={<OutlinedInput />}
                    displayEmpty
                    IconComponent={ExpandMoreIcon}
                    renderValue={(selected) => (selected.length ? selected.join(', ') : t('filter.all'))}
                    MenuProps={MenuProps}
                    className="select-dropdown-common"
                    sx={selectSx}
                  >
                    {cityValues.map((value) => (
                      <MenuItem key={value} value={value}>
                        <Checkbox checked={city.includes(value)} />
                        <ListItemText primary={value.charAt(0).toUpperCase() + value.slice(1)} />
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <div className="marital-wrapper">
                  <label className="filter-label">{t('filter.maritalStatus')}:</label>
                  <Select
                    multiple
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    input={<OutlinedInput />}
                    displayEmpty
                    IconComponent={ExpandMoreIcon}
                    renderValue={(selected) => (selected.length ? selected.map((v) => t(`marital.${v}`)).join(', ') : t('filter.all'))}
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

              <p className="submit-notice-msg">{t('filter.waitNotice')}</p>
              <Box className="submit-btn-box">
                <Button
                  variant="contained"
                  disabled={!!fromAgeError || !!toAgeError || !!error}
                  onClick={handleSubmit}
                  sx={{ backgroundColor: '#ae003d' }}
                >
                  {t('filter.submit')}
                </Button>
              </Box>
            </div>
          </div>
        </div>

        <TeamSection />
      </div>
    </div>
  )
}
