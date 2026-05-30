import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

const LANGUAGES = [
  { code: 'gu', label: 'ગુ' },
  { code: 'hi', label: 'हि' },
  { code: 'en', label: 'EN' },
] as const

export default function LanguageSwitcher() {
  const { t } = useTranslation()

  return (
    <Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={i18n.language}
        onChange={(_, value) => {
          if (value) void i18n.changeLanguage(value)
        }}
        aria-label={t('nav.language')}
      >
        {LANGUAGES.map(({ code, label }) => (
          <ToggleButton key={code} value={code} sx={{ minWidth: 44, fontWeight: 600 }}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}
