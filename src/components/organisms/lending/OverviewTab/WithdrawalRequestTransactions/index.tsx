'use client'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import TransactionFilters from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions/TransactionFilters'
import WithdrawalRequestTransactionsTable from '@/components/organisms/lending/OverviewTab/WithdrawalRequestTransactions/WithdrawalRequestTransactionsTable'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

import { getWithdrawalTransactions } from '@/utils'

type WithdrawalRequestTransactionProps = {
  poolId: string
  currentEpoch: string
}

const WithdrawalRequestTransactions: React.FC<
  WithdrawalRequestTransactionProps
> = ({ poolId, currentEpoch }) => {
  const { t } = getTranslation()

  const { isLoading, transactionHistory } = useTransactionHistory(currentEpoch)

  if (isLoading || !transactionHistory) return null

  const filteredTransactions = transactionHistory.filter(
    (transaction) => poolId === transaction.lendingPool.id
  )

  const withdrawalTransactions = getWithdrawalTransactions(filteredTransactions)

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('lending.poolOverview.transactionsHistory.withdrawTitle')}
      />
      <CustomInnerCardContent sx={{ px: 0 }}>
        <TransactionHistoryState>
          <TransactionFilters />
          <WithdrawalRequestTransactionsTable
            currentEpoch={currentEpoch}
            withdrawalTransactions={withdrawalTransactions}
          />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default WithdrawalRequestTransactions
