import useModalState from '@/hooks/context/useModalState'

import WithdrawModal from '@/components/organisms/modals/WithdrawModal'

import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'
import WithdrawModalProvider from '@/context/withdrawModal/withdrawModal.provider'

interface WithdrawModalWrapperProps {
  handleClose: () => void
}

const WithdrawModalWrapper: React.FC<WithdrawModalWrapperProps> = ({
  handleClose,
}) => {
  const { modal } = useModalState()

  const { pool, trancheBalance } = modal[ModalsKeys.WITHDRAW]

  const defaultTranche = trancheBalance.find(
    ({ balanceData }) => !balanceData.availableToWithdraw.isZero()
  )

  return (
    <WithdrawModalProvider
      defaultTrancheId={
        (defaultTranche?.id ?? pool.tranches[0].id) as `0x${string}`
      }
      defaultPool={pool}
    >
      <ModalStatusState>
        <StepperState steps={3}>
          <WithdrawModal handleClose={handleClose} />
        </StepperState>
      </ModalStatusState>
    </WithdrawModalProvider>
  )
}

export default WithdrawModalWrapper
