import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import LendingPortfolioTableFooter from '@/components/molecules/portfolio/LendingPortfolioTableFooter'
import LendingPortfolioTableHeader from '@/components/molecules/portfolio/LendingPortfolioTableHeader'
import LendingPortfolioTableRow from '@/components/molecules/portfolio/LendingPortfolioTableRow'

import { toBigNumber } from '@/utils'

export type UserLendingPortfolio = {
  lendingPool: {
    id: string
    name: string
    tranches: {
      name: string
      id: string
      apy: string
      investedAmount: string
      yieldEarnings: {
        lastEpoch: string
        lastMonth: string
        lastYear: string
        lifetime: string
      }
    }[]
  }
  weightedApy: string
  totalInvestedAmount: string
  totalYieldEarningsLastEpoch: string
  totalYieldEarningsLastMonth: string
  totalYieldEarningsLastYear: string
  totalYieldEarningsLifetime: string
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED'
}

const DATA: UserLendingPortfolio[] = [
  {
    totalInvestedAmount: '4000000',
    totalYieldEarningsLastEpoch: '2000000',
    totalYieldEarningsLastMonth: '2000000',
    totalYieldEarningsLastYear: '2000000',
    totalYieldEarningsLifetime: '2000000',
    weightedApy: '2.93',
    lendingPool: {
      id: '0x1',
      name: 'test pool 1',
      tranches: [
        {
          apy: '0.125',
          id: '0x1',
          name: 'Senior Tranche',
          investedAmount: '1000000',
          yieldEarnings: {
            lastEpoch: '1000000',
            lastMonth: '1000000',
            lastYear: '1000000',
            lifetime: '1000000',
          },
        },
        {
          apy: '0.105',
          id: '0x2',
          name: 'Junior Tranche',
          investedAmount: '3000000',
          yieldEarnings: {
            lastEpoch: '1000000',
            lastMonth: '1000000',
            lastYear: '1000000',
            lifetime: '1000000',
          },
        },
      ],
    },
    status: 'ACTIVE',
  },
  {
    totalInvestedAmount: '6000000',
    totalYieldEarningsLastEpoch: '1000000',
    totalYieldEarningsLastMonth: '4000000',
    totalYieldEarningsLastYear: '2000000',
    totalYieldEarningsLifetime: '1000000',
    weightedApy: '5',
    lendingPool: {
      id: '0x2',
      name: 'test pool 2',
      tranches: [
        {
          apy: '0.125',
          id: '0x1',
          name: 'Senior Tranche',
          investedAmount: '6000000',
          yieldEarnings: {
            lastEpoch: '1000000',
            lastMonth: '4000000',
            lastYear: '2000000',
            lifetime: '1000000',
          },
        },
      ],
    },
    status: 'SUSPENDED',
  },
  {
    totalInvestedAmount: '5000000',
    totalYieldEarningsLastEpoch: '3000000',
    totalYieldEarningsLastMonth: '3000000',
    totalYieldEarningsLastYear: '8000000',
    totalYieldEarningsLifetime: '3000000',
    weightedApy: '3.96',
    lendingPool: {
      id: '0x3',
      name: 'test pool 3',
      tranches: [
        {
          apy: '0.125',
          id: '0x1',
          name: 'Senior Tranche',
          investedAmount: '1500000',
          yieldEarnings: {
            lastEpoch: '1000000',
            lastMonth: '1000000',
            lastYear: '2000000',
            lifetime: '1000000',
          },
        },
        {
          apy: '0.125',
          id: '0x2',
          name: 'Mezzanine Tranche',
          investedAmount: '2000000',
          yieldEarnings: {
            lastEpoch: '1000000',
            lastMonth: '1000000',
            lastYear: '1400000',
            lifetime: '1000000',
          },
        },
        {
          apy: '0.105',
          id: '0x3',
          name: 'Junior Tranche',
          investedAmount: '1500000',
          yieldEarnings: {
            lastEpoch: '1000000',
            lastMonth: '1000000',
            lastYear: '4600000',
            lifetime: '1000000',
          },
        },
      ],
    },
    status: 'CLOSED',
  },
]

export const LENDING_PORTFOLIO_KEYS = [
  'poolName',
  'weightedApy',
  'totalInvestedAmount',
  'totalYieldEarningsLastEpoch',
  'totalYieldEarningsLastMonth',
  'totalYieldEarningsLastYear',
  'totalYieldEarningsLifetime',
] as const

const LendingPortfolioTable = () => {
  const handleSort = (
    a: UserLendingPortfolio,
    b: UserLendingPortfolio,
    sort: Sort<typeof LENDING_PORTFOLIO_KEYS>
  ) => {
    const direction = sort.direction === 'asc' ? 1 : -1

    if (sort.key === 'poolName') {
      return a.lendingPool.name.localeCompare(b.lendingPool.name) * direction
    }

    return (
      (toBigNumber(a[sort.key]).div(toBigNumber('1')).toNumber() -
        toBigNumber(b[sort.key]).div(toBigNumber('1')).toNumber()) *
      direction
    )
  }
  return (
    <CustomTable
      headers={(handleSortChange, sort) => (
        <LendingPortfolioTableHeader
          handleSortChange={handleSortChange}
          sort={sort}
        />
      )}
      sortKeys={LENDING_PORTFOLIO_KEYS}
      data={DATA}
      defaultSortKey='weightedApy'
      handleSort={handleSort}
      headersStyle={{
        '& .MuiTableCell-root': {
          py: '6px',
          px: 2,
          '&.MuiTableCell-alignRight .MuiTableSortLabel-icon': {
            order: -1,
          },
        },
      }}
      footer={<LendingPortfolioTableFooter lendingPortfolio={DATA} />}
      footerStyle={{
        '& .MuiTableCell-root': {
          background: 'none',
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
