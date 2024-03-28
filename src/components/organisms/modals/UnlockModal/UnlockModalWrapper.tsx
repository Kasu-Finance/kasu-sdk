import useLockPeriods from '@/hooks/locking/useLockPeriods'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import UnlockModal from '@/components/organisms/modals/UnlockModal'

import LockModalState from '@/context/lockModal/lockModal.provider'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'

const UnlockModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { lockPeriods } = useLockPeriods()

  return (
    // we don't need lockPeriods but refactoring LockModalState is
    // unncessary because lockPeriod is fetched once and cached
    <LockModalState defaultLockPeriod={lockPeriods[0]}>
      <ModalStatusState>
        <UnlockModal handleClose={handleClose} />
      </ModalStatusState>
    </LockModalState>
  )
}

export default UnlockModalWrapper
