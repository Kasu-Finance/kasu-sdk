import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import PortfolioRewardsTableFooter from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableFooter'
import PortfolioRewardsTableHeader from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableHeader'
import PortfolioRewardsTableRow from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableRow'

import { toBigNumber } from '@/utils'

export type PortfolioRewards = {
  label: string
  lastEpoch:
    | {
        ksuAmount?: string
        usdcAmount: string
      }
    | undefined
  lifetime: {
    ksuAmount?: string
    usdcAmount: string
  }
}

const DATA: PortfolioRewards[] = [
  {
    label: 'Bonus Yield Earnings',
    lastEpoch: {
      ksuAmount: '100000',
      usdcAmount: '50000',
    },
    lifetime: {
      ksuAmount: '10000000',
      usdcAmount: '500000',
    },
  },
  {
    label: 'Protocol Fees',
    lastEpoch: {
      usdcAmount: '100000',
    },
    lifetime: {
      usdcAmount: '10000000',
    },
  },
  {
    label: 'KSU Launch Bonus',
    lastEpoch: undefined,
    lifetime: {
      ksuAmount: '1000',
      usdcAmount: '500',
    },
  },
]

export const PORTFOLIO_REWARDS_KEY = ['lastEpoch', 'lifetime'] as const

const PortfolioRewardsTable = () => {
  const handleSort = (
    a: PortfolioRewards,
    b: PortfolioRewards,
    sort: Sort<typeof PORTFOLIO_REWARDS_KEY>
  ) => {
    const direction = sort.direction === 'asc' ? 1 : -1

    const aValue = a[sort.key]?.usdcAmount ?? '0'
    const bValue = b[sort.key]?.usdcAmount ?? '0'

    return (
      (toBigNumber(aValue).div(toBigNumber('1')).toNumber() -
        toBigNumber(bValue).div(toBigNumber('1')).toNumber()) *
      direction
    )
  }

  return (
    <CustomTable
      headers={(handleSortChange, sort) => (
        <PortfolioRewardsTableHeader
          handleSortChange={handleSortChange}
          sort={sort}
        />
      )}
      pagination={false}
      data={DATA}
      sortKeys={PORTFOLIO_REWARDS_KEY}
      defaultSortKey='lastEpoch'
      handleSort={handleSort}
      footer={<PortfolioRewardsTableFooter portfolioRewards={DATA} />}
      headersStyle={{
        '& .MuiTableCell-root': {
          py: '6px',
          px: 2,
        },
      }}
    >
      {(data) =>
        data.map((portfolioReward, index) => (
          <PortfolioRewardsTableRow
            portfolioReward={portfolioReward}
            key={index}
          />
        ))
      }
    </CustomTable>
  )
}

export default PortfolioRewardsTable
