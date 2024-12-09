'use client'

import useLoanTickets from '@/hooks/lending/useLoanTickets'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import TransactionFilters from '@/components/organisms/lending/OverviewTab/UserTransactions/TransactionFilters'
import PortfolioUserTransactionSkeleton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionSkeleton'
import PortfolioUserTransactionTable from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTable'

import { getDetailedTransactions } from '@/utils'

type PortfolioUserTransactionTableWrapperProps = {
  currentEpoch: string
}

const PortfolioUserTransactionTableWrapper: React.FC<
  PortfolioUserTransactionTableWrapperProps
> = ({ currentEpoch }) => {
  const { transactionHistory, isLoading } = useTransactionHistory(currentEpoch)

  const { loanTickets, isLoading: loanTicketsLoading } = useLoanTickets()

  if (isLoading || !transactionHistory || !loanTickets || loanTicketsLoading) {
    return <PortfolioUserTransactionSkeleton />
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

  if (!pools.length)
    return (
      <EmptyDataPlaceholder
        pb={3}
        text='You have not deposited into any lending strategies...'
      />
    )

  const detailedTransactions = getDetailedTransactions(
    transactionHistory,
    loanTickets
  )

  return (
    <>
      <TransactionFilters pools={pools} withReallocation />
      <PortfolioUserTransactionTable
        currentEpoch={currentEpoch}
        detailedTransactions={detailedTransactions}
      />
    </>
  )
}

export default PortfolioUserTransactionTableWrapper
