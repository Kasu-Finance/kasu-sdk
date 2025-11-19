import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { Button } from '@mui/material'
import React, { memo } from 'react'

import useBuyKasuModalState from '@/hooks/context/useBuyKasuModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import { SupportedTokens } from '@/constants/tokens'

type BuyKasuEditActionProps = {
  amount: string
  amountInUSD: string | undefined
  selectedToken: SupportedTokens
  selectedLockPeriod: LockPeriod
}

const BuyKasuEditAction: React.FC<BuyKasuEditActionProps> = ({
  amount,
  amountInUSD,
  selectedLockPeriod,
  selectedToken,
}) => {
  const { t } = getTranslation()

  const { nextStep } = useStepperState()

  const { modalStatus } = useModalStatusState()

  const { setAmount, setAmountInUSD, setSelectedToken, setSelectedLockPeriod } =
    useBuyKasuModalState()

  const handleClick = () => {
    setSelectedToken(selectedToken)
    setAmount(amount)
    setAmountInUSD(amountInUSD)
    setSelectedLockPeriod(selectedLockPeriod)

    nextStep()
  }

  return (
    <Button
      variant='contained'
      color='secondary'
      onClick={handleClick}
      fullWidth
      sx={{ textTransform: 'capitalize' }}
      disabled={Boolean(
        !amount ||
          !amountInUSD ||
          modalStatus.type === 'error' ||
          modalStatus.type === 'focused'
      )}
    >
      {t('modals.buyKasu.completed.action')}
    </Button>
  )
}

export default memo(BuyKasuEditAction)
