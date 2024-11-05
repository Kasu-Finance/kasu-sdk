import { Button } from '@mui/material'
import { Box } from '@mui/system'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'

type RequestDetailsActionProps = {
  detailedTransaction: DetailedTransaction
  handleClose: () => void
}

const RequestDetailsAction: React.FC<RequestDetailsActionProps> = ({
  detailedTransaction,
  handleClose,
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleCancel = () => {
    if ('canCancel' in detailedTransaction) {
      openModal({
        name: ModalsKeys.CANCEL_DEPOSIT,
        transaction: detailedTransaction,
      })
      handleClose()
    }
  }

  return (
    <Box display='flex' gap={4}>
      <Button
        variant='outlined'
        color='secondary'
        fullWidth
        sx={{ textTransform: 'capitalize' }}
        onClick={handleClose}
      >
        {t('general.close')}
      </Button>
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        onClick={handleCancel}
        sx={{ textTransform: 'capitalize' }}
      >
        {detailedTransaction.requestType === 'Deposit'
          ? t('modals.cancelDeposit.cancel-button')
          : t('modals.cancelWithdrawal.cancel-button')}
      </Button>
    </Box>
  )
}

export default RequestDetailsAction
