import useStepperState from '@/hooks/context/useStepperState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import WithdrawFundsAtExpiryConfirmed from '@/components/organisms/modals/WithdrawFundsAtExpiryModal/WithdrawFundsAtExpiryConfirmed'
import WithdrawFundsAtExpiryEdit from '@/components/organisms/modals/WithdrawFundsAtExpiryModal/WIthdrawFundsAtExpiryEdit'

const WithdrawFundsAtExpiryModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = getTranslation()

  const { activeStep } = useStepperState()

  return (
    <CustomCard>
      <DialogHeader
        title={t(
          activeStep === 1
            ? 'modals.withdrawFundsAtExpiry.title'
            : 'modals.withdrawFundsAtExpiry.confirmedTitle'
        )}
        onClose={handleClose}
      />
      <DialogContent p={0}>
        {activeStep === 1 ? (
          <WithdrawFundsAtExpiryEdit handleClose={handleClose} />
        ) : (
          <WithdrawFundsAtExpiryConfirmed handleClose={handleClose} />
        )}
      </DialogContent>
    </CustomCard>
  )
}

export default WithdrawFundsAtExpiryModal
