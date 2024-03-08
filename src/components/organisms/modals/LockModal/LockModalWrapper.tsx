import useLockPeriods from '@/hooks/locking/useLockPeriods'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import LockModal from '@/components/organisms/modals/LockModal'

import LockModalState from '@/context/lockModal/lockModal.provider'

const LockModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { lockPeriods } = useLockPeriods()

  return (
    <LockModalState defaultLockPeriod={lockPeriods[0]}>
      <LockModal handleClose={handleClose} />
    </LockModalState>
  )
}

export default LockModalWrapper
