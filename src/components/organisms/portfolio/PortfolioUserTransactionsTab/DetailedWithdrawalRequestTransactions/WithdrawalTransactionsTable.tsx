import { TableCell, TableRow } from '@mui/material'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import usePagination from '@/hooks/usePagination'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import WithdrawalTransactionsTableBody from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/WithdrawalTransactionsTableBody'
import WithdrawalTransactionsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedWithdrawalRequestTransactions/WithdrawalTransactionsTableHeader'

import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

type WithdrawalTransactionsTableProps = {
  withdrawalTransactions: WithdrawalTransactionWrapper[]
  currentEpoch: string
}

const ROW_PER_PAGE = 5

const WithdrawalTransactionsTable: React.FC<
  WithdrawalTransactionsTableProps
> = ({ withdrawalTransactions, currentEpoch }) => {
  const { poolId, trancheType } = useTransactionHistoryState()

  const filteredData: WithdrawalTransactionWrapper[] =
    withdrawalTransactions.filter((transaction) => {
      return (
        (poolId === 'All' || poolId === transaction.poolId) &&
        (trancheType === 'All Tranches' ||
          transaction.trancheName === trancheType)
      )
    })

  const { currentPage, setPage, paginateData } = usePagination(
    ROW_PER_PAGE,
    filteredData.length
  )

  return (
    <CustomTable
      tableHeader={<WithdrawalTransactionsTableHeader />}
      tableBody={
        filteredData.length ? (
          <WithdrawalTransactionsTableBody
            currentEpoch={currentEpoch}
            withdrawalTransactions={[...paginateData(filteredData)]}
          />
        ) : (
          <TableRow>
            <TableCell colSpan={7} sx={{ py: 7 }}>
              {withdrawalTransactions.length ? (
                <NoMatchingFilter />
              ) : (
                <EmptyDataPlaceholder text='You have not yet made any Withdrawal Requests...' />
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

export default WithdrawalTransactionsTable
