import { Alert } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import BrowseFilterForm from '@/components/browse/BrowseFilterForm'
import Loader from '@/components/Loader'
import RibbonCard from '@/components/RibbonCard'
import SiteNavbar from '@/components/SiteNavbar'
import TeamSection from '@/components/TeamSection'
import { setBrowseFilters } from '@/duck/slice'
import { useProfiles } from '@/hooks/useProfiles'
import {
  applyBrowseFilters,
  emptyBrowseFilterCriteria,
  validateBrowseFilterAges,
  type BrowseFilterCriteria,
} from '@/utils/browseFilters'
import './Filter.css'

export default function FilterPage() {
  const { t } = useTranslation()
  const { profiles, loading, error } = useProfiles('approved', true, { publicBrowseOnly: true })
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [criteria, setCriteria] = useState<BrowseFilterCriteria>(emptyBrowseFilterCriteria())
  const [fromAgeError, setFromAgeError] = useState('')
  const [toAgeError, setToAgeError] = useState('')

  useEffect(() => {
    document.body.style.background = '#DBE3F0'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  useEffect(() => {
    const { fromAgeError: fe, toAgeError: te } = validateBrowseFilterAges(
      criteria.fromAge,
      criteria.toAge,
      t,
    )
    setFromAgeError(fe)
    setToAgeError(te)
  }, [criteria.fromAge, criteria.toAge, t])

  const handleSubmit = () => {
    const validation = validateBrowseFilterAges(criteria.fromAge, criteria.toAge, t)
    if (!validation.valid) return

    const results = applyBrowseFilters(profiles, criteria)
    dispatch(setBrowseFilters({ criteria, results }))
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
          <RibbonCard label={t('ribbon.filter')} contentClassName="filter-box-container">
            <BrowseFilterForm
              profiles={profiles}
              criteria={criteria}
              onCriteriaChange={setCriteria}
              fromAgeError={fromAgeError}
              toAgeError={toAgeError}
              onSubmit={handleSubmit}
              submitDisabled={!!error}
            />
          </RibbonCard>
        </div>

        <TeamSection />
      </div>
    </div>
  )
}
