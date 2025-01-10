import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const WeightedAverageApyTooltip = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='baseXs'>
        {t('weightedAverageApy.tooltip-1')}
        <br />
        <br />
        {t('variableAndFixedApy.tooltip-2')}
        <br />
        <br />
        {t('weightedAverageApy.tooltip-3')}
      </Typography>
    </Stack>
  )
}

export default WeightedAverageApyTooltip
