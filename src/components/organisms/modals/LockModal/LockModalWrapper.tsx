import useModalState from '@/hooks/context/useModalState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import LockModal from '@/components/organisms/modals/LockModal'

import LockModalState from '@/context/lockModal/lockModal.provider'
import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'

const LockModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

  const { lockPeriods } = modal[ModalsKeys.LOCK]

  return (
    <LockModalState defaultLockPeriod={lockPeriods[0]}>
      <ModalStatusState>
        <StepperState steps={3}>
          <LockModal handleClose={handleClose} />
        </StepperState>
      </ModalStatusState>
    </LockModalState>
  )
}

export default LockModalWrapper
