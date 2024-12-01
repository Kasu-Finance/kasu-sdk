import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import Subheading from '@/components/organisms/riskWarning/Subheading'

const CreditRisk = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.riskWarning.subheader-6.title')} />
      <Stack spacing={1}>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-6.description-1')}
        </Typography>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-6.description-2')}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default CreditRisk
