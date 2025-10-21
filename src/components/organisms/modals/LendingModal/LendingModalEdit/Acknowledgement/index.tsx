import {
  Button,
  FormControl,
  FormGroup,
  FormHelperText,
  Typography,
} from '@mui/material'
import { memo } from 'react'

import getTranslation from '@/hooks/useTranslation'

import AcknowledgementContent from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement/AcknowledgementContent'

import { Routes } from '@/config/routes'
import { customTypography } from '@/themes/typography'

export type AcknowledgementTypes = 'riskWarning' | 'termsAndConditions'

export type AcknowledgementStateType = Record<AcknowledgementTypes, boolean>

const Acknowledgement = () => {
  const { t } = getTranslation()

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
        <AcknowledgementContent />
      </FormGroup>
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
    </FormControl>
  )
}

export default memo(Acknowledgement)
