import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomStepper from '@/components/atoms/CustomStepper'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import LendingModalConfirmed from '@/components/organisms/modals/LendingModal/LendingModalConfirmed'
import LendingModalEdit from '@/components/organisms/modals/LendingModal/LendingModalEdit'
import LendingModalReview from '@/components/organisms/modals/LendingModal/LendingModalReview'

const getActiveComponent = (activeStep: number) => {
  switch (activeStep) {
    case 1:
      return <LendingModalEdit />
    case 2:
      return <LendingModalReview />
    case 3:
      return <LendingModalConfirmed />
    default:
      return null
  }
}

const LendingModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { activeStep } = useStepperState()

  return (
    <CustomCard>
      <DialogHeader title={t('modals.lending.title')} onClose={handleClose} />
      <DialogContent>
        <CustomStepper />
        {getActiveComponent(activeStep)}
      </DialogContent>
    </CustomCard>
  )
}

export default LendingModal
