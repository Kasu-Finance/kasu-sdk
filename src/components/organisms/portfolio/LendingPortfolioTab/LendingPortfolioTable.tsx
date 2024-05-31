import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'

import CustomTable from '@/components/molecules/CustomTable'
import TableSkeleton from '@/components/molecules/loaders/TableSkeleton'
import LendingPortfolioTableFooter from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTableFooter'
import LendingPortfolioTableHeader from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTableHeader'
import LendingPortfolioTableRow from '@/components/molecules/portfolio/lendingPortfolioTab/LendingPortfolioTableRow'

export const LENDING_PORTFOLIO_KEYS = [
  'poolName',
  'weightedApy',
  'totalInvestedAmount',
  'totalYieldEarningsLastEpoch',
  'totalYieldEarningsLifetime',
] as const

const LendingPortfolioTable = () => {
  const { lendingPortfolioData, isLoading } = useLendingPortfolioData()

  if (isLoading || !lendingPortfolioData)
    return <TableSkeleton rows={6} columns={3} />

  return (
    <CustomTable
      headers={LendingPortfolioTableHeader}
      sortKeys={LENDING_PORTFOLIO_KEYS}
      data={lendingPortfolioData.lendingPools}
      defaultSortKey='weightedApy'
      handleSort={() => 0}
      headersStyle={{
        '& .MuiTableCell-root': {
          py: '6px',
          px: 2,
          textTransform: 'capitalize',

          '&.apy': {
            pr: 0,
          },

          '&.MuiTableCell-alignRight .MuiTableSortLabel-icon': {
            order: -1,
          },
        },
      }}
      footer={
        <LendingPortfolioTableFooter
          lendingPortfolio={lendingPortfolioData!.lendingPools}
        />
      }
      footerStyle={{
        '& .MuiTableCell-root': {
          background: 'none',
          height: '100px',
          textTransform: 'capitalize',
        },
      }}
    >
      {(data) =>
        data.map((userPortfolio, index) => {
          return (
            <LendingPortfolioTableRow portfolio={userPortfolio} key={index} />
          )
        })
      }
    </CustomTable>
  )
}

export default LendingPortfolioTable
