import { Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'

const AcknowledgementMessage = () => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const handleRiskWarningOpen = () =>
    openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

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
          onClick={handleRiskWarningOpen}
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
