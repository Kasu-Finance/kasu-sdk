import useLockPeriods from '@/hooks/locking/useLockPeriods'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import LockModal from '@/components/organisms/modals/LockModal'

import LockModalState from '@/context/lockModal/lockModal.provider'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'

const LockModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { lockPeriods } = useLockPeriods()

  return (
    <LockModalState defaultLockPeriod={lockPeriods[0]}>
      <ModalStatusState>
        <LockModal handleClose={handleClose} />
      </ModalStatusState>
    </LockModalState>
  )
}

export default LockModalWrapper
