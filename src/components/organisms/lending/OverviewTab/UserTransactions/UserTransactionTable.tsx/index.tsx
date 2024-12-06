'use client'

import { TableCell, TableRow } from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import usePagination from '@/hooks/usePagination'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import UserTransactionTableBody from '@/components/organisms/lending/OverviewTab/UserTransactions/UserTransactionTable.tsx/UserTransactionTableBody'
import UserTransactionTableHeader from '@/components/organisms/lending/OverviewTab/UserTransactions/UserTransactionTable.tsx/UserTransactionTableHeader'

type UserTransactionTableProps = {
  transactionHistory: UserRequest[]
  currentEpoch: string
}

const ROW_PER_PAGE = 5

const UserTransactionTable: React.FC<UserTransactionTableProps> = ({
  transactionHistory,
  currentEpoch,
}) => {
  const { status, trancheType, transactionType } = useTransactionHistoryState()

  const filteredData: UserRequest[] = transactionHistory.filter(
    (transaction) => {
      return (
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
      tableHeader={<UserTransactionTableHeader />}
      tableBody={
        filteredData.length ? (
          <UserTransactionTableBody
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

export default UserTransactionTable
