import { Button } from '@mui/material'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import getTranslation from '@/hooks/useTranslation'

const WithdrawModalEditActions = () => {
  const { t } = getTranslation()

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
      sx={{ textTransform: 'capitalize' }}
    >
      {t('lending.withdraw.button.review')}
    </Button>
  )
}

export default WithdrawModalEditActions
