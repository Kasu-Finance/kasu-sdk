import { useMemo } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

import HorizontalStepper from '@/components/molecules/HorizontalStepper'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

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
  const { t } = useTranslation()

  const { modalStatusAction } = useModalStatusState()

  const STEPS = useMemo(
    () => [t('general.request'), t('general.approved'), t('general.confirmed')],
    [t]
  )

  return (
    <HorizontalStepper
      steps={STEPS}
      activeStep={getActiveStep(modalStatusAction) || 0}
    />
  )
}

export default DepositModalStepper
