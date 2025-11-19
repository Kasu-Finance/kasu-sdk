import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'
import BuyKasuModalConfirmation from '@/components/organisms/modals/BuyKasuModal/BuyKasuConfirmation'
import BuyKasuModalEdit from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit'
import BuyKasuModalReview from '@/components/organisms/modals/BuyKasuModal/BuyKasuReview'
const getActiveComponent = (activeStep: number) => {
  switch (activeStep) {
    case 1:
      return <BuyKasuModalEdit />
    case 2:
      return <BuyKasuModalReview />
    case 3:
      return <BuyKasuModalConfirmation />
    default:
      return null
  }
}

const BuyKasuModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { activeStep } = useStepperState()

  const getActiveTitle = (activeStep: number) => {
    switch (activeStep) {
      case 1:
        return t('modals.buyKasu.title.edit')
      case 2:
        return t('modals.buyKasu.title.review')
      case 3:
        return t('modals.buyKasu.title.confirmation')
      default:
        return null
    }
  }

  return (
    <CustomCard>
      <DialogHeader title={getActiveTitle(activeStep)} onClose={handleClose} />
      <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
        {getActiveComponent(activeStep)}
      </WaveBox>
    </CustomCard>
  )
}

export default BuyKasuModal
