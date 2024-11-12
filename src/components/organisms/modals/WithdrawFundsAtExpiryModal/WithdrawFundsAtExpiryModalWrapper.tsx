import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WithdrawFundsAtExpiryModal from '@/components/organisms/modals/WithdrawFundsAtExpiryModal'

import StepperState from '@/context/stepper/stepper.provider'

const WIthdrawFundsAtExpiryModalWrapper: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  return (
    <StepperState steps={2}>
      <WithdrawFundsAtExpiryModal handleClose={handleClose} />
    </StepperState>
  )
}

export default WIthdrawFundsAtExpiryModalWrapper
