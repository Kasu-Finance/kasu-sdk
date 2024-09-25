import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import LendingModalEdit from '@/components/organisms/modals/LendingModal/LendingModalEdit'
import LendingModalStepper from '@/components/organisms/modals/LendingModal/LendingModalStepper'

const LendingModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <DialogHeader title={t('modals.lending.title')} onClose={handleClose} />
      <DialogContent>
        <LendingModalStepper />
        <LendingModalEdit />
      </DialogContent>
    </CustomCard>
  )
}

export default LendingModal
