import { LockPeriod } from '@kasufinance/kasu-sdk'
import { Button } from '@mui/material'
import React, { memo } from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

type LockModalEditActionsProps = {
  amount: string
  selectedLockPeriod: LockPeriod
}

const LockModalEditActions: React.FC<LockModalEditActionsProps> = ({
  amount,
  selectedLockPeriod,
}) => {
  const { t } = getTranslation()

  const { nextStep } = useStepperState()

  const { setAmount, setSelectedLockPeriod } = useLockModalState()

  const { modalStatus } = useModalStatusState()

  const handleClick = () => {
    setAmount(amount)
    setSelectedLockPeriod(selectedLockPeriod)

    nextStep()
  }

  return (
    <Button
      onClick={handleClick}
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

export default memo(LockModalEditActions)
