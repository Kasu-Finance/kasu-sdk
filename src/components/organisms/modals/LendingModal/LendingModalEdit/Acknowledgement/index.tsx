import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Typography,
} from '@mui/material'
import { useEffect, useReducer } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useTranslation from '@/hooks/useTranslation'

import CustomCheckbox from '@/components/atoms/CustomCheckbox'

import { Routes } from '@/config/routes'
import { customTypography } from '@/themes/typography'

type AcknowledgementTypes = 'riskWarning' | 'termsAndConditions'

type AcknowledgementStateType = Record<AcknowledgementTypes, boolean>

const Acknowledgement = () => {
  const { t } = useTranslation()

  const { termsAccepted, setTermsAccepted } = useDepositModalState()

  const [checked, toggleChecked] = useReducer(
    (
      prev: AcknowledgementStateType,
      acknowledgement: AcknowledgementTypes
    ) => ({ ...prev, [acknowledgement]: !prev[acknowledgement] }),
    {
      riskWarning: termsAccepted,
      termsAndConditions: termsAccepted,
    }
  )

  useEffect(() => {
    if (checked.riskWarning && checked.termsAndConditions) {
      setTermsAccepted(true)
    } else {
      setTermsAccepted(false)
    }
  }, [checked, setTermsAccepted])

  return (
    <FormControl>
      <FormGroup
        sx={{
          '.MuiFormControlLabel-root': {
            m: 0,
            alignItems: 'flex-start',
            '.MuiCheckbox-root': {
              mr: 2,
              bgcolor: 'white',
            },

            '.MuiTypography-root': {
              mt: 0.25,
            },

            '& + .MuiFormControlLabel-root': {
              mt: 2,
            },
          },
        }}
      >
        <FormControlLabel
          control={
            <CustomCheckbox
              checked={checked.riskWarning}
              onChange={() => toggleChecked('riskWarning')}
              name='risk warning acknowledgement'
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
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <CustomCheckbox
              checked={checked.termsAndConditions}
              onChange={() => toggleChecked('termsAndConditions')}
              name='Important Information Document acknowledgement'
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
                href={Routes.lending.termsAndConditions.url}
                target='_blank'
              >
                {t('modals.lending.acknowledgement.termsAndConditions')}
              </Button>
            </Typography>
          }
        />
      </FormGroup>
      <FormHelperText
        sx={{
          margin: '16px 0 0 0',
          color: 'gray.extraDark',
          ...customTypography.baseSm,
        }}
      >
        <Typography variant='baseSmBold' component='span'>
          You accept that:
        </Typography>{' '}
        if this tranche is oversubscribed, you will be automatically reallocated
        to a lower APY tranche (if one is available). Refer to the{' '}
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
        for full details.
      </FormHelperText>
    </FormControl>
  )
}

export default Acknowledgement
