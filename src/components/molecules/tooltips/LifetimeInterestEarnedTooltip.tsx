import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

const LifetimeInterestEarnedTooltip = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant='baseXs'>
        {t('lifetimeInterestEarned.tooltip-1')}
        <br />
        <br />
        {t('lifetimeInterestEarned.tooltip-2')}
        <br />
        <br />
        {t('lifetimeInterestEarned.tooltip-3')}
      </Typography>
    </Stack>
  )
}

export default LifetimeInterestEarnedTooltip
