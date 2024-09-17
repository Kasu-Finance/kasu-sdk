'use client'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'

import TransactionFilters from '@/components/organisms/lending/OverviewTab/UserTransactions/TransactionFilters'
import PortfolioUserTransactionSkeleton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/PortfolioUserTransactionSkeleton'
import PortfolioUserTransactionTable from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/PortfolioUserTransactionTable'

const PortfolioUserTransactionTableWrapper = () => {
  const { transactionHistory, isLoading } = useTransactionHistory()

  if (isLoading || !transactionHistory) {
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

  return (
    <>
      <TransactionFilters pools={pools} />
      <PortfolioUserTransactionTable transactionHistory={transactionHistory} />
    </>
  )
}

export default PortfolioUserTransactionTableWrapper
