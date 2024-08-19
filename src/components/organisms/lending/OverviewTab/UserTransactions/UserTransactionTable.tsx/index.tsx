'use client'

import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

import usePagination from '@/hooks/usePagination'

import CustomTableTest from '@/components/molecules/CustomTableTest'
import UserTransactionTableBody from '@/components/organisms/lending/OverviewTab/UserTransactions/UserTransactionTable.tsx/UserTransactionTableBody'
import UserTransactionTableHeader from '@/components/organisms/lending/OverviewTab/UserTransactions/UserTransactionTable.tsx/UserTransactionTableHeader'

type UserTransactionTableProps = {
  transactionHistory: UserRequest[]
}

const ROW_PER_PAGE = 5

const UserTransactionTable: React.FC<UserTransactionTableProps> = ({
  transactionHistory,
}) => {
  const { currentPage, setPage, paginateData } = usePagination(
    ROW_PER_PAGE,
    transactionHistory.length
  )

  return (
    <CustomTableTest
      tableHeader={<UserTransactionTableHeader />}
      tableBody={
        <UserTransactionTableBody
          transactions={paginateData([...transactionHistory])}
        />
      }
      paginationProps={
        transactionHistory.length > ROW_PER_PAGE
          ? {
              count: Math.ceil(transactionHistory.length / ROW_PER_PAGE),
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
