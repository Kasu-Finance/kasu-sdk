'use client'

import { TableCell, TableRow } from '@mui/material'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import usePagination from '@/hooks/usePagination'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import LendingRequestsTransactionsTableBody from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions/LendingRequestsTransactionsTable/LendingRequestsTransactionsTableBody'
import LendingRequestsTransactionsTableHeader from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions/LendingRequestsTransactionsTable/LendingRequestsTransactionsTableHeader'

import { DetailedTransactionWrapper } from '@/utils/lending/getDetailedTransactions'

type LendingRequestsTransactionsTableProps = {
  transactionHistory: DetailedTransactionWrapper[]
  currentEpoch: string
}

const ROW_PER_PAGE = 5

const LendingRequestsTransactionsTable: React.FC<
  LendingRequestsTransactionsTableProps
> = ({ transactionHistory, currentEpoch }) => {
  const { trancheType } = useTransactionHistoryState()

  const filteredData: DetailedTransactionWrapper[] = transactionHistory.filter(
    (transaction) => {
      return (
        trancheType === 'All Tranches' ||
        transaction.trancheName === trancheType
      )
    }
  )

  const { currentPage, setPage, paginateData } = usePagination(
    ROW_PER_PAGE,
    filteredData.length
  )

  return (
    <CustomTable
      tableHeader={<LendingRequestsTransactionsTableHeader />}
      tableBody={
        filteredData.length ? (
          <LendingRequestsTransactionsTableBody
            currentEpoch={currentEpoch}
            transactions={paginateData([...filteredData])}
          />
        ) : (
          <TableRow>
            <TableCell colSpan={7} sx={{ py: 7 }}>
              {transactionHistory.length ? (
                <NoMatchingFilter />
              ) : (
                <EmptyDataPlaceholder text='You have not deposited into this lending strategy...' />
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
      sx={{ pb: 0 }}
    />
  )
}

export default LendingRequestsTransactionsTable
