import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

const GrossApyTooltip = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='baseXs'>
        <Typography variant='baseXsBold' color='gold.dark'>
          {t('general.grossApy')}:{' '}
        </Typography>
        {t('grossApy.tooltip-1')}
      </Typography>
      <Typography variant='baseXs'>
        <Typography variant='baseXsBold' color='gold.dark'>
          {t('general.netApy')}:{' '}
        </Typography>
        {t('grossApy.tooltip-2')}
      </Typography>
    </Stack>
  )
}

export default GrossApyTooltip
