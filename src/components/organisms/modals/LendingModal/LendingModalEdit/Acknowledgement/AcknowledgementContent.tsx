import { Button, FormControlLabel, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomCheckbox from '@/components/atoms/CustomCheckbox'

import { Routes } from '@/config/routes'

const AcknowledgementContent = () => {
  const { t } = getTranslation()

  const { termsAccepted, setTermsAccepted } = useDepositModalState()

  const toggleTermsAccepted = () => setTermsAccepted(!termsAccepted)

  return (
    <FormControlLabel
      control={
        <CustomCheckbox
          checked={termsAccepted}
          onChange={toggleTermsAccepted}
          name='acknowledgement'
        />
      }
      label={
        <Typography variant='baseMd' component='p'>
          {t('modals.lending.acknowledgement.base')}{' '}
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
          ,{' '}
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
          </Button>{' '}
          and{' '}
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
            href='https://docs.kasu.finance/risk-warnings/subordination-of-kasu-loans-to-senior-lender'
            target='_blank'
          >
            {t('modals.lending.acknowledgement.subordinationDisclosure')}
          </Button>
        </Typography>
      }
    />
  )
}

export default AcknowledgementContent
