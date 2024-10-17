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

const LendingModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal, openModal } = useModalState()

  const { setToast, removeToast } = useToastState()

  const { isVerifying, kycCompleted } = useKycState()

  const pool = modal[ModalsKeys.LEND].pool

  // handle account change admist lending (new account may not be kyc-ed)
  useEffect(() => {
    if (kycCompleted) {
      removeToast()
      return
    }

    if (isVerifying) {
      setToast({
        type: 'info',
        title: 'Account change detected',
        message: 'Verifying status of new account...',
        isClosable: false,
      })
      return
    }

    removeToast()
    handleClose()
    openModal({
      name: ModalsKeys.KYC,
      callback: () => openModal({ name: ModalsKeys.LEND, pool }),
    })
  }, [
    isVerifying,
    kycCompleted,
    pool,
    removeToast,
    setToast,
    handleClose,
    openModal,
  ])

  return (
    <DepositModalState
      defaultTrancheId={
        modal[ModalsKeys.LEND].pool.tranches[0].id as `0x${string}`
      }
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
