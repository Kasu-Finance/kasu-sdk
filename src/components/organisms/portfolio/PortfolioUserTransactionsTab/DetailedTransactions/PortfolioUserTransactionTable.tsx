import { TableCell, TableRow } from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import usePagination from '@/hooks/usePagination'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import PortfolioUserTransactionTableBody from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTableBody'
import PortfolioUserTransactionsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedTransactions/PortfolioUserTransactionTableHeader'

type PortfolioUserTransactionsTableProps = {
  transactionHistory: UserRequest[]
}

const ROW_PER_PAGE = 5

const PortfolioUserTransactionTable: React.FC<
  PortfolioUserTransactionsTableProps
> = ({ transactionHistory }) => {
  const { poolId, status, trancheType, transactionType } =
    useTransactionHistoryState()

  const filteredData: UserRequest[] = transactionHistory.filter(
    (transaction) => {
      return (
        (poolId === 'All' || poolId === transaction.lendingPool.id) &&
        (status === 'All' || transaction.status === status) &&
        (trancheType === 'All Tranches' ||
          transaction.trancheName === trancheType) &&
        (transactionType === 'All Transactions' ||
          transaction.requestType === transactionType)
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
            transactions={[...paginateData(filteredData)]}
          />
        ) : (
          <TableRow>
            <TableCell colSpan={6} sx={{ py: 7 }}>
              {transactionHistory.length ? (
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
