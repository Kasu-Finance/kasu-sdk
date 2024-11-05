import { Button } from '@mui/material'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

const LockModalEditActions = () => {
  const { t } = getTranslation()

  const { nextStep } = useStepperState()

  const { amount } = useLockModalState()

  const { modalStatus } = useModalStatusState()

  return (
    <Button
      onClick={nextStep}
      variant='contained'
      color='secondary'
      disabled={Boolean(
        !amount ||
          modalStatus.type === 'error' ||
          modalStatus.type === 'focused'
      )}
      sx={{ textTransform: 'capitalize' }}
    >
      {t('modals.lock.buttons.reviewLock')}
    </Button>
  )
}

export default LockModalEditActions
