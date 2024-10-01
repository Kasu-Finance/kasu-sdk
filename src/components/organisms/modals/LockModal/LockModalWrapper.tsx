import useLockPeriods from '@/hooks/locking/useLockPeriods'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import LockModal from '@/components/organisms/modals/LockModal'

import LockModalState from '@/context/lockModal/lockModal.provider'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'

const LockModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { lockPeriods } = useLockPeriods()

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
