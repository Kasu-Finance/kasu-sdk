import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import FixApyEdit from '@/components/organisms/modals/FixApyModal/FixApyEdit'
const getActiveComponent = (activeStep: number) => {
  switch (activeStep) {
    case 1:
      return <FixApyEdit />
    case 2:
      return 'hi'
    default:
      return null
  }
}

const FixApyModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { activeStep } = useStepperState()

  return (
    <CustomCard>
      <DialogHeader title={t('modals.fixApy.title')} onClose={handleClose} />
      <DialogContent>{getActiveComponent(activeStep)}</DialogContent>
    </CustomCard>
  )
}

export default FixApyModal
