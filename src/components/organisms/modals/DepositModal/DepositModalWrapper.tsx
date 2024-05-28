import useModalState from '@/hooks/context/useModalState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DepositModal from '@/components/organisms/modals/DepositModal'

import DepositModalState from '@/context/depositModal/depositModal.provider'
import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'

const DepositModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

  return (
    <DepositModalState
      defaultTrancheId={
        modal[ModalsKeys.DEPOSIT].poolData.tranches[0].trancheId
      }
      initialAmount={modal[ModalsKeys.DEPOSIT].initialAmount}
    >
      <ModalStatusState>
        <DepositModal handleClose={handleClose} />
      </ModalStatusState>
    </DepositModalState>
  )
}

export default DepositModalWrapper
