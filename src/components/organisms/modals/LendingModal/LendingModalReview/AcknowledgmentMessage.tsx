import { Button, Stack, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import { Routes } from '@/config/routes'

const AcknowledgementMessage = () => {
  const { t } = useTranslation()

  return (
    <Stack spacing={1}>
      <Typography variant='baseMd' component='p'>
        {t('modals.lending.acknowledgement.acknowledged')}{' '}
        <Button
          variant='text'
          sx={{
            p: 0,
            height: 'auto',
            textTransform: 'unset',
            font: 'inherit',
            verticalAlign: 'inherit',
            display: 'inline',
            color: 'white',
          }}
          href={Routes.lending.riskWarning.url}
          target='_blank'
        >
          {t('modals.lending.acknowledgement.riskWarning')}
        </Button>
      </Typography>
      <Typography variant='baseMd' component='p'>
        {t('modals.lending.acknowledgement.acknowledged')}{' '}
        <Button
          variant='text'
          sx={{
            p: 0,
            height: 'auto',
            textTransform: 'unset',
            font: 'inherit',
            verticalAlign: 'inherit',
            display: 'inline',
            color: 'white',
          }}
          href={Routes.lending.termsAndConditions.url}
          target='_blank'
        >
          {t('modals.lending.acknowledgement.termsAndConditions')}
        </Button>
      </Typography>
    </Stack>
  )
}

export default AcknowledgementMessage
