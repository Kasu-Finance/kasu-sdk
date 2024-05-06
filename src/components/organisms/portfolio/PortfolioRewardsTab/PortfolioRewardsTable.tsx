import { Divider, Grid, Skeleton } from '@mui/material'

import usePortfolioRewards, {
  PortfolioRewardsType,
} from '@/hooks/portfolio/usePortfolioRewards'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import PortfolioRewardsTableFooter from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableFooter'
import PortfolioRewardsTableHeader from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableHeader'
import PortfolioRewardsTableRow from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableRow'

import { toBigNumber } from '@/utils'

export const PORTFOLIO_REWARDS_KEY = ['lastEpoch', 'lifetime'] as const

const PortfolioRewardsTable = () => {
  const { portfolioRewards, isLoading } = usePortfolioRewards()

  const handleSort = (
    a: PortfolioRewardsType,
    b: PortfolioRewardsType,
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

  if (isLoading)
    return (
      <Grid container spacing={2}>
        <Grid item xs={6} />
        <Grid item xs={6}>
          <Skeleton sx={{ fontSize: '2.5rem' }} />
        </Grid>
        <Grid item xs={12}>
          <Divider />
          <Skeleton sx={{ fontSize: '2.5rem' }} />
          <Divider />
          <Skeleton sx={{ fontSize: '2.5rem' }} />
          <Divider />
          <Skeleton sx={{ fontSize: '2.5rem' }} />
          <Divider />
        </Grid>
      </Grid>
    )

  return (
    <CustomTable
      headers={(handleSortChange, sort) => (
        <PortfolioRewardsTableHeader
          handleSortChange={handleSortChange}
          sort={sort}
        />
      )}
      pagination={false}
      data={portfolioRewards}
      sortKeys={PORTFOLIO_REWARDS_KEY}
      defaultSortKey='lastEpoch'
      handleSort={handleSort}
      footer={
        <PortfolioRewardsTableFooter portfolioRewards={portfolioRewards} />
      }
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
