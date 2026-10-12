import CloseIcon from '@mui/icons-material/Close'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import VerifiedIcon from '@mui/icons-material/Verified'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import LayersIcon from '@mui/icons-material/Layers'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AdminStats, AdminTab } from '@/components/admin/adminTypes'
import { useAdminNameMap } from '@/hooks/useAdminUsers'
import { useCities } from '@/hooks/useCities'
import { isHiddenFromBrowseProfile } from '@/hooks/useProfiles'
import { useQualifications } from '@/hooks/useQualifications'
import { useSubCasts } from '@/hooks/useSubCasts'
import type { Profile } from '@/types/profile'
import {
  exportProfilesToExcel,
  type ExportScope,
} from '@/utils/adminExportExcel'
import { activeLanguage, buildLabelMap } from '@/utils/localizeReference'

interface AdminExportDialogProps {
  open: boolean
  onClose: () => void
  profiles: Profile[]
  filteredProfiles: Profile[]
  currentTab: AdminTab
  searchQuery: string
  stats: AdminStats
}

export default function AdminExportDialog({
  open,
  onClose,
  profiles,
  filteredProfiles,
  currentTab,
  searchQuery,
  stats,
}: AdminExportDialogProps) {
  const { t, i18n } = useTranslation()
  const { cities } = useCities()
  const { qualifications } = useQualifications()
  const { subCasts } = useSubCasts()
  const { nameById } = useAdminNameMap()

  const cityMap = useMemo(() => buildLabelMap(cities), [cities])
  const qualificationMap = useMemo(() => buildLabelMap(qualifications), [qualifications])
  const subCastMap = useMemo(() => buildLabelMap(subCasts), [subCasts])

  const initialLang = activeLanguage(i18n.language)
  const [selectedLanguage, setSelectedLanguage] = useState<'gu' | 'en'>(initialLang)

  const hasSearchOrTabFilter = Boolean(searchQuery.trim() || currentTab !== 'all')

  const defaultScope: ExportScope = useMemo(() => {
    if (hasSearchOrTabFilter && filteredProfiles.length > 0) {
      return 'filtered'
    }
    if (stats.approved > 0) {
      return 'approved'
    }
    return 'all'
  }, [hasSearchOrTabFilter, filteredProfiles.length, stats.approved])

  const [selectedScope, setSelectedScope] = useState<ExportScope>(defaultScope)
  const [isExporting, setIsExporting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSelectedLanguage(activeLanguage(i18n.language))
      setSelectedScope(defaultScope)
      setSuccessMessage(null)
      setIsExporting(false)
    }
  }, [open, i18n.language, defaultScope])

  // Determine export target profiles based on selected scope
  const targetProfiles = useMemo(() => {
    switch (selectedScope) {
      case 'filtered':
        return filteredProfiles
      case 'approved':
        return profiles.filter((p) => p.status === 'approved' && !isHiddenFromBrowseProfile(p))
      case 'pending':
        return profiles.filter((p) => p.status === 'pending' && !isHiddenFromBrowseProfile(p))
      case 'rejected':
        return profiles.filter((p) => p.status === 'rejected' && !isHiddenFromBrowseProfile(p))
      case 'hidden':
        return profiles.filter((p) => isHiddenFromBrowseProfile(p))
      case 'all':
      default:
        return profiles
    }
  }, [selectedScope, profiles, filteredProfiles])

  const handleExport = () => {
    if (targetProfiles.length === 0 && selectedScope !== 'all') return

    setIsExporting(true)
    setSuccessMessage(null)

    // Run export in next tick so UI reflects spinner
    setTimeout(() => {
      try {
        const result = exportProfilesToExcel({
          profiles: targetProfiles,
          allProfiles: profiles,
          language: selectedLanguage,
          scope: selectedScope,
          cityMap,
          qualificationMap,
          subCastMap,
          adminNameMap: nameById,
          t,
        })

        if (result.success) {
          setSuccessMessage(
            t('admin.export.success', {
              count: result.count,
              filename: result.filename,
            }),
          )
          // Keep dialog open briefly for user confirmation or auto-close after 1.8s
          setTimeout(() => {
            onClose()
          }, 1800)
        }
      } catch (err) {
        console.error('Export error:', err)
      } finally {
        setIsExporting(false)
      }
    }, 150)
  }

  const scopeOptions: Array<{
    scope: ExportScope
    label: string
    count: number
    icon: React.ReactNode
    subtitle?: string
  }> = [
    ...(hasSearchOrTabFilter
      ? [
          {
            scope: 'filtered' as ExportScope,
            label: t('admin.export.scopeFiltered', { count: filteredProfiles.length }),
            count: filteredProfiles.length,
            icon: <FilterListIcon fontSize="small" sx={{ color: 'rgb(174, 0, 61)' }} />,
            subtitle: searchQuery.trim()
              ? `"${searchQuery.trim()}" · ${t(`admin.${currentTab}`)}`
              : t(`admin.${currentTab}`),
          },
        ]
      : []),
    {
      scope: 'approved' as ExportScope,
      label: t('admin.export.scopeApproved', { count: stats.approved }),
      count: stats.approved,
      icon: <VerifiedIcon fontSize="small" sx={{ color: '#16a34a' }} />,
    },
    {
      scope: 'pending' as ExportScope,
      label: t('admin.export.scopePending', { count: stats.pending }),
      count: stats.pending,
      icon: <HourglassEmptyIcon fontSize="small" sx={{ color: '#d97706' }} />,
    },
    {
      scope: 'all' as ExportScope,
      label: t('admin.export.scopeAll', { count: profiles.length }),
      count: profiles.length,
      icon: <LayersIcon fontSize="small" sx={{ color: 'rgb(174, 0, 61)' }} />,
      subtitle: t('admin.export.allSheetsHint'),
    },
    ...(stats.rejected > 0
      ? [
          {
            scope: 'rejected' as ExportScope,
            label: t('admin.export.scopeRejected', { count: stats.rejected }),
            count: stats.rejected,
            icon: <CancelOutlinedIcon fontSize="small" sx={{ color: '#dc2626' }} />,
          },
        ]
      : []),
    ...(stats.hidden > 0
      ? [
          {
            scope: 'hidden' as ExportScope,
            label: t('admin.export.scopeHidden', { count: stats.hidden }),
            count: stats.hidden,
            icon: <VisibilityOffOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />,
          },
        ]
      : []),
  ]

  return (
    <Dialog
      open={open}
      onClose={isExporting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      className="admin-export-dialog"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(79, 15, 30, 0.2)',
        },
      }}
    >
      <DialogTitle className="admin-export-dialog__title">
        <Box display="flex" alignItems="center" gap={1.5} flex={1}>
          <Box className="admin-export-dialog__icon-wrap">
            <TableChartOutlinedIcon sx={{ color: 'rgb(174, 0, 61)', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" className="admin-export-dialog__heading">
              {t('admin.export.dialogTitle')}
            </Typography>
            <Typography variant="caption" className="admin-export-dialog__subheading">
              {t('admin.export.dialogSubtitle')}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isExporting}
          aria-label={t('admin.cancel')}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="admin-export-dialog__content">
        {successMessage ? (
          <Box className="admin-export-dialog__success-box">
            <CheckCircleOutlineIcon sx={{ fontSize: 52, color: '#16a34a', mb: 1.5 }} />
            <Typography variant="h6" fontWeight={700} color="#15803d">
              {t('admin.export.successTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={0.5}>
              {successMessage}
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Scope Selection */}
            <Box>
              <Typography variant="subtitle2" className="admin-export-dialog__section-label">
                {t('admin.export.scopeTitle')}
              </Typography>
              <Box className="admin-export-dialog__scope-list">
                {scopeOptions.map((opt) => {
                  const isSelected = selectedScope === opt.scope
                  return (
                    <Box
                      key={opt.scope}
                      component="button"
                      type="button"
                      className={`admin-export-scope-card ${
                        isSelected ? 'admin-export-scope-card--active' : ''
                      }`}
                      onClick={() => setSelectedScope(opt.scope)}
                    >
                      <Box display="flex" alignItems="center" gap={1.25} flex={1} minWidth={0}>
                        <Box className="admin-export-scope-card__icon">{opt.icon}</Box>
                        <Box textAlign="left" minWidth={0}>
                          <Typography
                            variant="body2"
                            fontWeight={isSelected ? 700 : 600}
                            className="admin-export-scope-card__title"
                          >
                            {opt.label}
                          </Typography>
                          {opt.subtitle && (
                            <Typography
                              variant="caption"
                              className="admin-export-scope-card__subtitle"
                            >
                              {opt.subtitle}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Radio
                        checked={isSelected}
                        onChange={() => setSelectedScope(opt.scope)}
                        value={opt.scope}
                        size="small"
                        sx={{
                          color: 'rgba(174, 0, 61, 0.4)',
                          '&.Mui-checked': { color: 'rgb(174, 0, 61)' },
                          p: 0.5,
                        }}
                      />
                    </Box>
                  )
                })}
              </Box>
            </Box>

            {/* Language Selection */}
            <Box>
              <Typography variant="subtitle2" className="admin-export-dialog__section-label">
                {t('admin.export.languageTitle')}
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  row
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'gu' | 'en')}
                  className="admin-export-dialog__lang-group"
                >
                  <FormControlLabel
                    value="gu"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          '&.Mui-checked': { color: 'rgb(174, 0, 61)' },
                        }}
                      />
                    }
                    label={t('admin.export.langGu')}
                    className={`admin-export-lang-chip ${
                      selectedLanguage === 'gu' ? 'admin-export-lang-chip--active' : ''
                    }`}
                  />
                  <FormControlLabel
                    value="en"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          '&.Mui-checked': { color: 'rgb(174, 0, 61)' },
                        }}
                      />
                    }
                    label={t('admin.export.langEn')}
                    className={`admin-export-lang-chip ${
                      selectedLanguage === 'en' ? 'admin-export-lang-chip--active' : ''
                    }`}
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Summary Box */}
            <Box className="admin-export-dialog__summary">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label=".xlsx"
                    size="small"
                    className="admin-export-dialog__format-chip"
                  />
                  <Typography variant="body2" fontWeight={600} color="#1e293b">
                    {t('admin.export.summary', { count: targetProfiles.length })}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {selectedLanguage === 'gu' ? 'ગુજરાતી હેડર' : 'English Headers'}
                </Typography>
              </Box>
              <Typography variant="caption" className="admin-export-dialog__fields-note">
                {t('admin.export.fieldsIncludedNote')}
              </Typography>
            </Box>

            {targetProfiles.length === 0 && (
              <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                {t('admin.export.noProfiles')}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      {!successMessage && (
        <DialogActions className="admin-export-dialog__actions">
          <Button
            className="admin-btn admin-btn--edit"
            onClick={onClose}
            disabled={isExporting}
          >
            {t('admin.cancel')}
          </Button>
          <Button
            variant="contained"
            className="admin-btn admin-btn--export-download"
            disabled={isExporting || targetProfiles.length === 0}
            onClick={handleExport}
            startIcon={
              isExporting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <FileDownloadIcon />
              )
            }
          >
            {isExporting
              ? t('admin.export.downloading')
              : t('admin.export.downloadButton', { count: targetProfiles.length })}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
