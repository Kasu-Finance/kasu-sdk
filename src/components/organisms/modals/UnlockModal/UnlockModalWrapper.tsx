import useModalState from '@/hooks/context/useModalState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import UnlockModal from '@/components/organisms/modals/UnlockModal'

import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'
import UnlockModalState from '@/context/unlockModal/unlockModal.provider'

const UnlockModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

  const { userLock } = modal[ModalsKeys.UNLOCK]

  return (
    // we don't need lockPeriods but refactoring LockModalState is
    // unncessary because lockPeriod is fetched once and cached
    <UnlockModalState defaultUserLock={userLock}>
      <ModalStatusState>
        <StepperState steps={3}>
          <UnlockModal handleClose={handleClose} />
        </StepperState>
      </ModalStatusState>
    </UnlockModalState>
  )
}

export default UnlockModalWrapper
