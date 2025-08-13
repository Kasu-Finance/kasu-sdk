import {
  Button,
  FormControl,
  FormGroup,
  FormHelperText,
  Typography,
} from '@mui/material'
import { memo, useEffect, useReducer } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import getTranslation from '@/hooks/useTranslation'

import AcknowledgementContent from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement/AcknowledgementContent'

import { Routes } from '@/config/routes'
import { customTypography } from '@/themes/typography'

export type AcknowledgementTypes = 'riskWarning' | 'termsAndConditions'

export type AcknowledgementStateType = Record<AcknowledgementTypes, boolean>

const Acknowledgement = () => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const { termsAccepted, setTermsAccepted } = useDepositModalState()

  const [checked, toggleChecked] = useReducer(
    (
      prev: AcknowledgementStateType,
      acknowledgement: AcknowledgementTypes
    ) => ({ ...prev, [acknowledgement]: !prev[acknowledgement] }),
    { riskWarning: termsAccepted, termsAndConditions: termsAccepted }
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
            '.MuiCheckbox-root': { mr: 2, bgcolor: 'white' },

            '.MuiTypography-root': { mt: 0.25 },

            '& + .MuiFormControlLabel-root': { mt: 2 },
          },
        }}
      >
        <AcknowledgementContent
          checked={checked}
          toggleChecked={toggleChecked}
        />
      </FormGroup>
      {!isLiteMode && (
        <FormHelperText
          sx={{
            margin: '16px 0 0 0',
            color: 'gray.extraDark',
            ...customTypography.baseSm,
          }}
        >
          <Typography variant='baseSmBold' component='span'>
            {t('modals.lending.acknowledgement.edit.description-1')}
          </Typography>{' '}
          {t('modals.lending.acknowledgement.edit.description-2')}{' '}
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
          {t('modals.lending.acknowledgement.edit.description-3')}
        </FormHelperText>
      )}
    </FormControl>
  )
}

export default memo(Acknowledgement)
