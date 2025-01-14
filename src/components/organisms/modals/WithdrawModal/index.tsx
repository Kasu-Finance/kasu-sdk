'use client'

import useStepperState from '@/hooks/context/useStepperState'
import getTranslation, { TranslationKeys } from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomStepper from '@/components/atoms/CustomStepper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import WithdrawalModalConfirmed from '@/components/organisms/modals/WithdrawModal/WithdrawalModalConfirmed'
import WithdrawModalEdit from '@/components/organisms/modals/WithdrawModal/WithdrawModalEdit'
import WithdrawModalReview from '@/components/organisms/modals/WithdrawModal/WithdrawModalReview'

interface WithdrawModalProps {
  handleClose: () => void
}

const getActiveComponent = (activeStep: number) => {
  switch (activeStep) {
    case 1:
      return <WithdrawModalEdit />
    case 2:
      return <WithdrawModalReview />
    case 3:
      return <WithdrawalModalConfirmed />
    default:
      return null
  }
}

const getActiveTitle = (activeStep: number): TranslationKeys => {
  switch (activeStep) {
    case 3:
      return 'modals.withdrawal.confirmedTitle'
    case 2:
      return 'modals.withdrawal.reviewTitle'
    default:
      return 'modals.withdrawal.title'
  }
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { activeStep } = useStepperState()

  return (
    <CustomCard>
      <DialogHeader
        title={t(getActiveTitle(activeStep))}
        onClose={handleClose}
      />
      <DialogContent>
        <CustomStepper />
        {getActiveComponent(activeStep)}
      </DialogContent>
    </CustomCard>
  )
}

export default WithdrawModal
