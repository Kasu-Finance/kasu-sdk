'use client'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import TransactionFilters from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions/TransactionFilters'
import WithdrawalTransactionsSkeleton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/WithdrawalTransactionsSkeleton'
import WithdrawalTransactionsTable from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/WithdrawalTransactionsTable'

import { getWithdrawalTransactions } from '@/utils'

type WithdrawalTransactionsTableWrapperProps = {
  currentEpoch: string
}

const WithdrawalTransactionsTableWrapper: React.FC<
  WithdrawalTransactionsTableWrapperProps
> = ({ currentEpoch }) => {
  const { transactionHistory, isLoading } = useTransactionHistory(currentEpoch)

  if (isLoading || !transactionHistory) {
    return <WithdrawalTransactionsSkeleton />
  }

  //   transform into unique array of objects
  const pools = [
    ...new Set(
      transactionHistory.map(({ lendingPool }) =>
        JSON.stringify({
          id: lendingPool.id,
          name: lendingPool.name,
        })
      )
    ),
  ].map((pool) => JSON.parse(pool))

  const withdrawalTransactions = getWithdrawalTransactions(transactionHistory)

  if (!pools.length || !withdrawalTransactions.length)
    return (
      <EmptyDataPlaceholder
        pb={3}
        text='You have not yet made any Withdrawal Requests...'
      />
    )

  return (
    <>
      <TransactionFilters pools={pools} />
      <WithdrawalTransactionsTable
        currentEpoch={currentEpoch}
        withdrawalTransactions={withdrawalTransactions}
      />
    </>
  )
}

export default WithdrawalTransactionsTableWrapper
