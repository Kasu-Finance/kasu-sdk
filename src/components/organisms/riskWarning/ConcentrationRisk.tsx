import { Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import Subheading from '@/components/organisms/riskWarning/Subheading'

const ConcentrationRisk = () => {
  const { t } = getTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.riskWarning.subheader-10.title')} />
      <Stack spacing={1}>
        <Typography variant='baseMd'>
          {t('modals.riskWarning.subheader-10.description')}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default ConcentrationRisk
