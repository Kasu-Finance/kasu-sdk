import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const GrossApyTooltip = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='baseXs'>
        {t('grossApy.tooltip-1')}
        <br />
        <br />
        {t('grossApy.tooltip-2')}
        <br />
        <br />
        {t('grossApy.tooltip-3')}
      </Typography>
    </Stack>
  )
}

export default GrossApyTooltip
