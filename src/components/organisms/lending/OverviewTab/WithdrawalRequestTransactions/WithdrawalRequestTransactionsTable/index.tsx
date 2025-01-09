import { TableCell, TableRow } from '@mui/material'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import usePagination from '@/hooks/usePagination'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import WithdrawalRequestTransactionsTableBody from '@/components/organisms/lending/OverviewTab/WithdrawalRequestTransactions/WithdrawalRequestTransactionsTable/WithdrawalRequestTransactionsTableBody'
import WithdrawalRequestTransactionsTableHeader from '@/components/organisms/lending/OverviewTab/WithdrawalRequestTransactions/WithdrawalRequestTransactionsTable/WithdrawalRequestTransactionsTableHeader'

import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type WithdrawalRequestTransactionsTableProps = {
  withdrawalTransactions: WithdrawalTransactionWrapper[]
  currentEpoch: string
}

const ROW_PER_PAGE = 5

const WithdrawalRequestTransactionsTable: React.FC<
  WithdrawalRequestTransactionsTableProps
> = ({ withdrawalTransactions, currentEpoch }) => {
  const { trancheType } = useTransactionHistoryState()

  const filteredData: WithdrawalTransactionWrapper[] =
    withdrawalTransactions.filter((transaction) => {
      return (
        trancheType === 'All Tranches' ||
        transaction.trancheName === trancheType
      )
    })

  const { currentPage, setPage, paginateData } = usePagination(
    ROW_PER_PAGE,
    filteredData.length
  )

  return (
    <CustomTable
      tableHeader={<WithdrawalRequestTransactionsTableHeader />}
      tableBody={
        filteredData.length ? (
          <WithdrawalRequestTransactionsTableBody
            currentEpoch={currentEpoch}
            withdrawalTransactions={[...paginateData(filteredData)]}
          />
        ) : (
          <TableRow>
            <TableCell colSpan={7} sx={{ py: 7 }}>
              {withdrawalTransactions.length ? (
                <NoMatchingFilter />
              ) : (
                <EmptyDataPlaceholder text='You have not withdrawn from any lending strategies...' />
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

export default WithdrawalRequestTransactionsTable
