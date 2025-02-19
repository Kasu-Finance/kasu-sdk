import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import Subheading from '@/components/organisms/riskWarning/Subheading'

const CurrencyExchangeRisk = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.riskWarning.subheader-12.title')} />
      <Stack spacing={1}>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-12.description-1')}
        </Typography>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-12.description-2')}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default CurrencyExchangeRisk
