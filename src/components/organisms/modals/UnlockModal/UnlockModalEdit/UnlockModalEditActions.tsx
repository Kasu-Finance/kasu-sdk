import { Button } from '@mui/material'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import useUnlockModalState from '@/hooks/context/useUnlockModalState'
import getTranslation from '@/hooks/useTranslation'

const UnlockModalEditActions = () => {
  const { t } = getTranslation()

  const { nextStep } = useStepperState()

  const { amount } = useUnlockModalState()

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
      {t('modals.unlock.buttons.reviewUnlock')}
    </Button>
  )
}

export default UnlockModalEditActions
