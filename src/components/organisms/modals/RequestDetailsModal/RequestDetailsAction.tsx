import { Button } from '@mui/material'
import { Box } from '@mui/system'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { DetailedTransactionWrapper } from '@/utils/lending/getDetailedTransactions'
import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type RequestDetailsActionProps = {
  currentEpoch: string
  detailedTransaction: DetailedTransactionWrapper | WithdrawalTransactionWrapper
  handleClose: () => void
}

const RequestDetailsAction: React.FC<RequestDetailsActionProps> = ({
  currentEpoch,
  detailedTransaction,
  handleClose,
}) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleCancel = () => {
    const totalAmount = detailedTransaction.transactions.reduce(
      (total, cur) => total + parseFloat(cur.requestedAmount),
      0
    )

    const transaction = detailedTransaction.transactions[0]

    openModal({
      name:
        detailedTransaction.type === 'Deposit'
          ? ModalsKeys.CANCEL_DEPOSIT
          : ModalsKeys.CANCEL_WITHDRAWAL,
      transaction: {
        timestamp: detailedTransaction.lastTransactionDate,
        apy: transaction.apy,
        amount: totalAmount.toString(),
        fixedTermConfig: detailedTransaction.fixedTermConfig,
        lendingPool: transaction.lendingPool,
        nftId: transaction.nftId,
        requestType: detailedTransaction.type,
        trancheName: detailedTransaction.trancheName,
      },
      currentEpoch,
    })
    handleClose()
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
        {detailedTransaction.type === 'Deposit'
          ? t('modals.cancelDeposit.cancel-button')
          : t('modals.cancelWithdrawal.cancel-button')}
      </Button>
    </Box>
  )
}

export default RequestDetailsAction
