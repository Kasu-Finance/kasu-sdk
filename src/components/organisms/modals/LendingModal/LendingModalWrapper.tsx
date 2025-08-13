import { useEffect } from 'react'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import LendingModal from '@/components/organisms/modals/LendingModal'

import DepositModalState from '@/context/depositModal/depositModal.provider'
import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'

import { toBigNumber } from '@/utils'

const LendingModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal, openModal } = useModalState()

  const { removeToast } = useToastState()

  const { isVerifying, kycCompleted } = useKycState()

  const {
    pools,
    pool,
    currentEpoch,
    currentEpochDepositedAmount,
    currentEpochFtdAmount,
  } = modal[ModalsKeys.LEND]

  // handle account change admist lending (new account may not be kyc-ed)
  useEffect(() => {
    if (!kycCompleted) {
      handleClose()
      openModal({
        name: ModalsKeys.KYC,
        callback: () =>
          openModal({
            name: ModalsKeys.LEND,
            pool,
            pools,
            currentEpoch,
            currentEpochDepositedAmount,
            currentEpochFtdAmount,
          }),
      })
    }
  }, [
    isVerifying,
    kycCompleted,
    currentEpoch,
    currentEpochDepositedAmount,
    currentEpochFtdAmount,
    pool,
    pools,
    openModal,
    handleClose,
    removeToast,
  ])

  const defaultTranche =
    pool.tranches.find(
      (tranche) => !toBigNumber(tranche.maximumDeposit).isZero()
    ) ?? pool.tranches[0]

  return (
    <DepositModalState
      pool={pool}
      defaultTrancheId={defaultTranche.id as `0x${string}`}
      initialFixedTermConfigId={
        defaultTranche.fixedTermConfig.length ? undefined : '0'
      }
      currentEpochDepositedAmountMap={currentEpochDepositedAmount}
      currentEpochFtdAmountMap={currentEpochFtdAmount}
    >
      <ModalStatusState>
        <StepperState steps={3}>
          <LendingModal handleClose={handleClose} />
        </StepperState>
      </ModalStatusState>
    </DepositModalState>
  )
}

export default LendingModalWrapper
