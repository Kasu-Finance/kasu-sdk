import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import FixApyModal from '@/components/organisms/modals/FixApyModal'

import FixApyState from '@/context/fixApyModal/fixApyModal.provider'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'

const FixApyModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  return (
    <FixApyState>
      <ModalStatusState>
        <StepperState steps={2}>
          <FixApyModal handleClose={handleClose} />
        </StepperState>
      </ModalStatusState>
    </FixApyState>
  )
}

export default FixApyModalWrapper
