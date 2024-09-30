import { Button } from '@mui/material'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'

const WithdrawModalEditActions = () => {
  const { t } = useTranslation()

  const { amount } = useWithdrawModalState()

  const { modalStatus } = useModalStatusState()

  const { nextStep } = useStepperState()

  return (
    <Button
      variant='contained'
      color='secondary'
      onClick={nextStep}
      disabled={Boolean(
        !amount ||
          modalStatus.type === 'error' ||
          modalStatus.type === 'focused'
      )}
    >
      {t('lending.withdraw.button.review')}
    </Button>
  )
}

export default WithdrawModalEditActions
