import { Button, Stack } from '@mui/material'
import React, { memo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'

type LendingModalEditActionsProps = {
  amount: string
  amountInUSD: string | undefined
  fixedTermConfigId: string | undefined
  trancheId: `0x${string}`
  selectedToken: SupportedTokens
}

const LendingModalEditActions: React.FC<LendingModalEditActionsProps> = ({
  selectedToken,
  amount,
  amountInUSD,
  fixedTermConfigId,
  trancheId,
}) => {
  const { t } = getTranslation()

  const { openModal, closeModal } = useModalState()

  const { nextStep } = useStepperState()

  const {
    termsAccepted,
    setSelectedToken,
    setAmount,
    setAmountInUSD,
    setFixedTermConfigId,
    setSelectedTranche,
  } = useDepositModalState()

  const { modalStatus } = useModalStatusState()

  const handleOpen = () =>
    openModal({
      name: ModalsKeys.LOYALTY_LEVELS,
      callback: () => closeModal(ModalsKeys.LEND),
    })

  const handleNextStep = () => {
    setSelectedToken(selectedToken)
    setSelectedTranche(trancheId)
    setAmount(amount)
    setAmountInUSD(amountInUSD)

    // default is set to 0 if defaultTranche.fixedTermConfig.length <=0
    if (fixedTermConfigId) {
      setFixedTermConfigId(fixedTermConfigId)
    }

    nextStep()
  }

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
        onClick={handleNextStep}
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
