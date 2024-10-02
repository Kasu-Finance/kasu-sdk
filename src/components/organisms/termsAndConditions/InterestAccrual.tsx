import { Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import Subheading from '@/components/organisms/termsAndConditions/Subheading'

const InterestAccrual = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Subheading title={t('modals.termsAndConditions.subheader-4.title')} />
      <Stack spacing={4}>
        <Typography variant='baseMd'>
          {t('modals.termsAndConditions.subheader-4.description')}
        </Typography>
        <Stack spacing={1}>
          <Typography variant='h5' color='gold.dark'>
            {t('modals.termsAndConditions.subheader-4.subtitle')}
          </Typography>
          <Typography variant='baseMd'>
            {t('modals.termsAndConditions.subheader-4.subtitle-description')}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default InterestAccrual
