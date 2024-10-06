import { Button, Stack } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import useTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

const LendingModalEditActions = () => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const { nextStep } = useStepperState()

  const { amount, amountInUSD, termsAccepted, fixedTermConfigId } =
    useDepositModalState()

  const { modalStatus } = useModalStatusState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  return (
    <Stack spacing={2}>
      <Button variant='outlined' color='secondary' onClick={handleOpen}>
        {t('modals.lending.buttons.increaseLoyaltyLevel')}
      </Button>
      <Button
        variant='contained'
        color='secondary'
        onClick={nextStep}
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

export default LendingModalEditActions
