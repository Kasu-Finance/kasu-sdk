import useModalState from '@/hooks/context/useModalState'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import BuyKasuModal from '@/components/organisms/modals/BuyKasuModal'

import BuyKasuModalState from '@/context/buyKasuModal/buyKasuModal.provider'
import { ModalsKeys } from '@/context/modal/modal.types'
import ModalStatusState from '@/context/modalStatus/modalStatus.provider'
import StepperState from '@/context/stepper/stepper.provider'

const BuyKasuModalWrapper: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()

  const { lockPeriods } = modal[ModalsKeys.BUY_KASU]

  return (
    <BuyKasuModalState defaultLockPeriod={lockPeriods[0]}>
      <ModalStatusState>
        <StepperState steps={3}>
          <BuyKasuModal handleClose={handleClose} />
        </StepperState>
      </ModalStatusState>
    </BuyKasuModalState>
  )
}

export default BuyKasuModalWrapper
