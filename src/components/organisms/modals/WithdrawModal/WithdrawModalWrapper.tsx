import WithdrawModal from '@/components/organisms/modals/WithdrawModal'

import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'
import WithdrawModalProvider from '@/context/withdrawModal/withdrawModal.provider'

interface WithdrawModalWrapperProps {
  handleClose: () => void
}

const WithdrawModalWrapper: React.FC<WithdrawModalWrapperProps> = ({
  handleClose,
}) => {
  return (
    <WithdrawModalProvider>
      <ModalStatusState>
        <StepperState steps={3}>
          <WithdrawModal handleClose={handleClose} />
        </StepperState>
      </ModalStatusState>
    </WithdrawModalProvider>
  )
}

export default WithdrawModalWrapper
