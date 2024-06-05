import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material'
import { ChangeEvent } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

const DepositDescription = () => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.TERMS_AND_CONDITIONS })

  const { setTermsAccepted, termsAccepted } = useDepositModalState()

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(event.target.checked)
  }

  return (
    <Box display='flex' flexDirection='column' pl={2}>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        flexWrap='wrap'
        mb={1}
      >
        <FormControlLabel
          control={
            <Checkbox checked={termsAccepted} onChange={handleCheckboxChange} />
          }
          label={
            <Typography variant='body2' component='span'>
              {t('modals.lock.deposit.description.metric-1')}{' '}
            </Typography>
          }
        />
        <Button
          onClick={handleOpen}
          variant='text'
          sx={{
            display: 'inline',
            height: 'auto',
            p: 0,
            mt: -1,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            textTransform: 'inherit',
          }}
        >
          {t('modals.lock.deposit.description.metric-2')}
        </Button>
      </Box>

      <Typography variant='subtitle2' component='p' textAlign='center' mb={2}>
        {t('modals.lock.deposit.description.metric-6')}
      </Typography>
      <Typography
        variant='caption'
        component='p'
        letterSpacing='0.4px'
        textAlign='center'
      >
        {t('modals.lock.deposit.description.metric-7')}
      </Typography>
    </Box>
  )
}

export default DepositDescription
