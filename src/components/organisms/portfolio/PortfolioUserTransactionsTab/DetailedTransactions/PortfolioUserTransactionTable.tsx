import { TableCell, TableRow } from '@mui/material'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import usePagination from '@/hooks/usePagination'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import PortfolioUserTransactionTableBody from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTableBody'
import PortfolioUserTransactionsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTableHeader'

import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'

type PortfolioUserTransactionsTableProps = {
  detailedTransactions: DetailedTransaction[]
}

const ROW_PER_PAGE = 5

const PortfolioUserTransactionTable: React.FC<
  PortfolioUserTransactionsTableProps
> = ({ detailedTransactions }) => {
  const { poolId, trancheType, transactionType, pendingDecision } =
    useTransactionHistoryState()

  const filteredData: DetailedTransaction[] = detailedTransactions.filter(
    (transaction) => {
      return (
        (poolId === 'All' || poolId === transaction.lendingPool.id) &&
        (trancheType === 'All Tranches' ||
          transaction.trancheName === trancheType) &&
        (transactionType === 'All Transactions' ||
          transaction.requestType === transactionType) &&
        (pendingDecision === 'All' || transaction.pendingDecisions.length > 0)
      )
    }
  )

  const { currentPage, setPage, paginateData } = usePagination(
    ROW_PER_PAGE,
    filteredData.length
  )

  return (
    <CustomTable
      tableHeader={<PortfolioUserTransactionsTableHeader />}
      tableBody={
        filteredData.length ? (
          <PortfolioUserTransactionTableBody
            detailedTransactions={[...paginateData(filteredData)]}
          />
        ) : (
          <TableRow>
            <TableCell colSpan={7} sx={{ py: 7 }}>
              {detailedTransactions.length ? (
                <NoMatchingFilter />
              ) : (
                <EmptyDataPlaceholder text='You have not deposited into any lending strategies...' />
              )}
            </TableCell>
          </TableRow>
        )
      }
      paginationProps={
        filteredData.length > ROW_PER_PAGE
          ? {
              count: Math.ceil(filteredData.length / ROW_PER_PAGE),
              page: currentPage,
              onChange: (_, page) => setPage(page),
            }
          : undefined
      }
    />
  )
}

export default PortfolioUserTransactionTable
