import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface BilingualFieldProps {
  labelKey: string
  hintKey: string
  children: ReactNode
}

export default function BilingualField({ labelKey, hintKey, children }: BilingualFieldProps) {
  const { t } = useTranslation()
  const hint = hintKey ? t(hintKey) : ''

  return (
    <Box className="form-field">
      <Typography className="field-label-primary">{t(labelKey)}</Typography>
      {hint ? <Typography className="field-label-hint">{hint}</Typography> : null}
      {children}
    </Box>
  )
}
