import useStepperState from '@/hooks/context/useStepperState'
import getTranslation, { TranslateFunction } from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import UnlockModalConfirmed from '@/components/organisms/modals/UnlockModal/UnlockModalConfirmed'
import UnlockModalEdit from '@/components/organisms/modals/UnlockModal/UnlockModalEdit/index'
import UnlockModalReview from '@/components/organisms/modals/UnlockModal/UnlockModalReview/index'

const getActiveComponent = (activeStep: number) => {
  switch (activeStep) {
    case 1:
      return <UnlockModalEdit />
    case 2:
      return <UnlockModalReview />
    case 3:
      return <UnlockModalConfirmed />
    default:
      return null
  }
}

const getTitle = (activeStep: number, t: TranslateFunction) => {
  switch (activeStep) {
    case 2:
      return t('modals.unlock.reviewTitle')
    case 3:
      return t('modals.unlock.confirmedTitle')
    default:
      return t('modals.unlock.title')
  }
}

const UnlockModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { activeStep } = useStepperState()

  return (
    <CustomCard>
      <DialogHeader title={getTitle(activeStep, t)} onClose={handleClose} />
      <DialogContent>{getActiveComponent(activeStep)}</DialogContent>
    </CustomCard>
  )
}

export default UnlockModal
