import useModalState from '@/hooks/context/useModalState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DepositModal from '@/components/organisms/modals/DepositModal'

import DepositModalState from '@/context/depositModal/depositModal.provider'
import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'

const DepositModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

  const {
    poolData,
    initialAmount,
    initialUsdAmount,
    initialTranche,
    initialToken,
  } = modal[ModalsKeys.DEPOSIT]

  return (
    <DepositModalState
      defaultTrancheId={poolData.tranches[0].trancheId}
      initialAmount={initialAmount}
      initialTranche={initialTranche}
      initialToken={initialToken}
      initialUsdAmount={initialUsdAmount}
    >
      <ModalStatusState>
        <DepositModal handleClose={handleClose} />
      </ModalStatusState>
    </DepositModalState>
  )
}

export default DepositModalWrapper
