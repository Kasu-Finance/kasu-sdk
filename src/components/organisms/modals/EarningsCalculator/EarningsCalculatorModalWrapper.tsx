import useModalState from '@/hooks/context/useModalState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import EarningsCalculatorModal from '@/components/organisms/modals/EarningsCalculator'

import DepositModalState from '@/context/depositModal/depositModal.provider'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'

const EarningsCalculatorModalWrapper: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { modal } = useModalState()

  return (
    <DepositModalState
      defaultTrancheId={
        modal.earningsCalculatorModal.pool.tranches[0].id as `0x${string}`
      }
    >
      <ModalStatusState>
        <EarningsCalculatorModal handleClose={handleClose} />
      </ModalStatusState>
    </DepositModalState>
  )
}

export default EarningsCalculatorModalWrapper
