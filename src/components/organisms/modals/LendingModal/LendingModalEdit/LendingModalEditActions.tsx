import { Button, Stack } from '@mui/material'
import { memo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

const LendingModalEditActions = () => {
  const { t } = getTranslation()

  const { openModal, closeModal } = useModalState()

  const { nextStep } = useStepperState()

  const { amount, amountInUSD, termsAccepted, fixedTermConfigId } =
    useDepositModalState()

  const { modalStatus } = useModalStatusState()

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.LOYALTY_LEVELS,
      callback: () => closeModal(ModalsKeys.LEND),
    })

  return (
    <Stack spacing={2}>
      <Button
        variant='outlined'
        color='secondary'
        onClick={handleOpen}
        sx={{ textTransform: 'capitalize' }}
      >
        {t('modals.lending.buttons.increaseLoyaltyLevel')}
      </Button>
      <Button
        variant='contained'
        color='secondary'
        onClick={nextStep}
        sx={{ textTransform: 'capitalize' }}
        disabled={Boolean(
          !amount ||
            !amountInUSD ||
            !fixedTermConfigId ||
            modalStatus.type === 'error' ||
            modalStatus.type === 'focused' ||
            !termsAccepted
        )}
      >
        {t('modals.lending.buttons.review')}
      </Button>
    </Stack>
  )
}

export default memo(LendingModalEditActions)
