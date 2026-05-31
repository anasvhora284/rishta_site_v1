import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import TuneIcon from '@mui/icons-material/Tune'
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import BrowseFilterForm from '@/components/browse/BrowseFilterForm'
import Loader from '@/components/Loader'
import { setBrowseFilters } from '@/duck/slice'
import type { RootState } from '@/duck/store'
import { useProfiles } from '@/hooks/useProfiles'
import {
  applyBrowseFilters,
  emptyBrowseFilterCriteria,
  validateBrowseFilterAges,
  type BrowseFilterCriteria,
} from '@/utils/browseFilters'
import '@/pages/Browse/Listing.css'

interface ListingFilterDialogProps {
  open: boolean
  onClose: () => void
  onApplied?: () => void
}

export default function ListingFilterDialog({
  open,
  onClose,
  onApplied,
}: ListingFilterDialogProps) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const savedCriteria = useSelector((state: RootState) => state.filter.criteria)
  const { profiles, loading, error } = useProfiles('approved', open, { publicBrowseOnly: true })

  const [criteria, setCriteria] = useState<BrowseFilterCriteria>(emptyBrowseFilterCriteria())
  const [fromAgeError, setFromAgeError] = useState('')
  const [toAgeError, setToAgeError] = useState('')

  useEffect(() => {
    if (open) {
      setCriteria(savedCriteria ?? emptyBrowseFilterCriteria())
      setFromAgeError('')
      setToAgeError('')
    }
  }, [open, savedCriteria])

  useEffect(() => {
    const { fromAgeError: fe, toAgeError: te } = validateBrowseFilterAges(
      criteria.fromAge,
      criteria.toAge,
      t,
    )
    setFromAgeError(fe)
    setToAgeError(te)
  }, [criteria.fromAge, criteria.toAge, t])

  const handleApply = () => {
    const validation = validateBrowseFilterAges(criteria.fromAge, criteria.toAge, t)
    if (!validation.valid) return

    const results = applyBrowseFilters(profiles, criteria)
    dispatch(setBrowseFilters({ criteria, results }))
    onApplied?.()
    onClose()
  }

  const handleReset = () => {
    const empty = emptyBrowseFilterCriteria()
    setCriteria(empty)
    const results = applyBrowseFilters(profiles, empty)
    dispatch(setBrowseFilters({ criteria: empty, results }))
    onApplied?.()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      className="listing-filter-dialog"
    >
      <DialogTitle className="listing-filter-dialog__title">
        <Box display="flex" alignItems="center" gap={1} flex={1}>
          <TuneIcon sx={{ color: 'rgb(174, 0, 61)' }} />
          <Typography component="span" variant="h6" fontWeight={700}>
            {t('listing.editFilters')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label={t('admin.cancel')} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="listing-filter-dialog__content">
        {loading ? (
          <Box py={4}>
            <Loader variant="inline" />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t('filter.error')}
              </Alert>
            )}
            <BrowseFilterForm
              profiles={profiles}
              criteria={criteria}
              onCriteriaChange={setCriteria}
              fromAgeError={fromAgeError}
              toAgeError={toAgeError}
              onSubmit={handleApply}
              submitDisabled={!!error}
              submitLabel={t('listing.applyFilters')}
              compact
            />
            <Box mt={1} display="flex" alignItems="center" gap={0.5}>
              <IconButton
                onClick={handleReset}
                size="small"
                sx={{ color: 'rgb(174, 0, 61)' }}
                aria-label={t('listing.resetFilters')}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
              <Typography
                component="button"
                type="button"
                variant="body2"
                onClick={handleReset}
                className="listing-filter-dialog__reset-label"
              >
                {t('listing.resetFilters')}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
