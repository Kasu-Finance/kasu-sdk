import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DepositModal from '@/components/organisms/modals/DepositModal'

import ModalStatusState from '@/context/modalStatus/modalStatus.provider'

const DepositModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  return (
    // we don't need lockPeriods but refactoring LockModalState is
    // unncessary because lockPeriod is fetched once and cached
    <ModalStatusState>
      <DepositModal handleClose={handleClose} />
    </ModalStatusState>
  )
}

export default DepositModalWrapper
