import useModalState from '@/hooks/context/useModalState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import BuyKasuModal from '@/components/organisms/modals/BuyKasuModal'

import BuyKasuModalState from '@/context/buyKasuModal/buyKasuModal.provider'
import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'

import FALLBACK_LOCK_PERIODS from '@/config/lockPeriod'

const BuyKasuModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

  const { lockPeriods = FALLBACK_LOCK_PERIODS } =
    modal[ModalsKeys.BUY_KASU] || {}
  const defaultLockPeriod = lockPeriods?.[0] || FALLBACK_LOCK_PERIODS[0]

  return (
    <BuyKasuModalState defaultLockPeriod={defaultLockPeriod}>
      <ModalStatusState>
        <StepperState steps={3}>
          <BuyKasuModal handleClose={handleClose} />
        </StepperState>
      </ModalStatusState>
    </BuyKasuModalState>
  )
}

export default BuyKasuModalWrapper
