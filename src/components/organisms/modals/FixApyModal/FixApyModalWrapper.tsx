import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import FixApyModal from '@/components/organisms/modals/FixApyModal'

import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'

const FixApyModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  return (
    <ModalStatusState>
      <StepperState steps={2}>
        <FixApyModal handleClose={handleClose} />
      </StepperState>
    </ModalStatusState>
  )
}

export default FixApyModalWrapper
