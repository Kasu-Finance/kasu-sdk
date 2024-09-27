import useModalState from '@/hooks/context/useModalState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import LendingModal from '@/components/organisms/modals/LendingModal'

import DepositModalState from '@/context/depositModal/depositModal.provider'
import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'

const LendingModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

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
