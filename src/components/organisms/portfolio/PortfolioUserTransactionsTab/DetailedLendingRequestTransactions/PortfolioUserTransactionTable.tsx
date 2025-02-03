import { TableCell, TableRow } from '@mui/material'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import usePagination from '@/hooks/usePagination'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import NoMatchingFilter from '@/components/atoms/NoMatchingFilter'
import CustomTable from '@/components/molecules/CustomTable'
import PortfolioUserTransactionTableBody from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedLendingRequestTransactions/PortfolioUserTransactionTableBody'
import PortfolioUserTransactionsTableHeader from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/DetailedLendingRequestTransactions/PortfolioUserTransactionTableHeader'

import { LoanTicketStatus } from '@/config/api.lendersAgreement'
import { DetailedTransactionWrapper } from '@/utils/lending/getDetailedTransactions'

type PortfolioUserTransactionsTableProps = {
  detailedTransactions: DetailedTransactionWrapper[]
  currentEpoch: string
}

const ROW_PER_PAGE = 5

const PortfolioUserTransactionTable: React.FC<
  PortfolioUserTransactionsTableProps
> = ({ detailedTransactions, currentEpoch }) => {
  const { poolId, trancheType, pendingDecision } = useTransactionHistoryState()

  const filteredData: DetailedTransactionWrapper[] =
    detailedTransactions.filter((transaction) => {
      return (
        (poolId === 'All' || poolId === transaction.poolId) &&
        (trancheType === 'All Tranches' ||
          transaction.trancheName === trancheType) &&
        (pendingDecision === 'All' ||
          transaction.currentDecisionStatus?.status ===
            LoanTicketStatus.emailSent)
      )
    })

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
            currentEpoch={currentEpoch}
            detailedTransactions={[...paginateData(filteredData)]}
          />
        ) : (
          <TableRow>
            <TableCell colSpan={7} sx={{ py: 7 }}>
              {detailedTransactions.length ? (
                <NoMatchingFilter />
              ) : (
                <EmptyDataPlaceholder text='You have not yet made any Lending Requests...' />
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
