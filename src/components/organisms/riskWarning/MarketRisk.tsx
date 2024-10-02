import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import Subheading from '@/components/organisms/riskWarning/Subheading'

const MarketRisk = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.riskWarning.subheader-4.title')} />
      <Stack spacing={1}>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-4.description')}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default MarketRisk
