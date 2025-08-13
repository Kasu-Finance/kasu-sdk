import { Button, FormControlLabel, Typography } from '@mui/material'
import React, { Dispatch } from 'react'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import getTranslation from '@/hooks/useTranslation'

import CustomCheckbox from '@/components/atoms/CustomCheckbox'
import { AcknowledgementTypes } from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'

import { Routes } from '@/config/routes'

type AcknowledgementContentProps = {
  checked: Record<AcknowledgementTypes, boolean>
  toggleChecked: Dispatch<AcknowledgementTypes>
}

const AcknowledgementContent: React.FC<AcknowledgementContentProps> = ({
  checked,
  toggleChecked,
}) => {
  const { t } = getTranslation()

  const { isLiteMode } = useLiteModeState()

  const handleLiteModeToggle = () => {
    toggleChecked('riskWarning')
    toggleChecked('termsAndConditions')
  }

  return isLiteMode ? (
    <FormControlLabel
      control={
        <CustomCheckbox
          checked={checked.riskWarning && checked.termsAndConditions}
          onChange={handleLiteModeToggle}
          name='risk warning and terms & conditions acknowledgement'
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
          </Button>{' '}
          and the{' '}
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
  ) : (
    <>
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
    </>
  )
}

export default AcknowledgementContent
