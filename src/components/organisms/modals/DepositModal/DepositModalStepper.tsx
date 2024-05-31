import useModalStatusState from '@/hooks/context/useModalStatusState'

import HorizontalStepper from '@/components/molecules/HorizontalStepper'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

const STEPS = ['Request', 'Approved', 'Confirmed']

const getActiveStep = (modalStatusAction: ModalStatusAction) => {
  switch (modalStatusAction) {
    case ModalStatusAction.EDITING:
      return 0
    case ModalStatusAction.REVIEWING:
      return 1
    case ModalStatusAction.COMPLETED:
      return 2
  }
}

const DepositModalStepper = () => {
  const { modalStatusAction } = useModalStatusState()

  return (
    <HorizontalStepper
      steps={STEPS}
      activeStep={getActiveStep(modalStatusAction) || 0}
    />
  )
}

export default DepositModalStepper
