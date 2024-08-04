import { Divider, Grid, Skeleton } from '@mui/material'

import usePortfolioRewards, {
  PortfolioRewardsType,
} from '@/hooks/portfolio/usePortfolioRewards'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import PortfolioRewardsMobileTableFooter from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsMobileTableFooter'
import PortfolioRewardsMobileTableRow from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsMobileTableRow'
import PortfolioRewardsTableFooter from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableFooter'
import PortfolioRewardsTableHeader from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableHeader'
import PortfolioRewardsTableRow from '@/components/molecules/portfolio/portfolioRewardsTab/PortfolioRewardsTableRow'

import { toBigNumber } from '@/utils'

export const PORTFOLIO_REWARDS_KEY = ['lastEpoch', 'lifeTime'] as const

const PortfolioRewardsTable = () => {
  const { portfolioRewards, isLoading } = usePortfolioRewards()

  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

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

  if (isLoading || !portfolioRewards)
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
      headers={
        isMobile
          ? []
          : (handleSortChange, sort) => (
              <PortfolioRewardsTableHeader
                handleSortChange={handleSortChange}
                sort={sort}
              />
            )
      }
      pagination={false}
      data={portfolioRewards}
      sortKeys={PORTFOLIO_REWARDS_KEY}
      defaultSortKey='lastEpoch'
      handleSort={handleSort}
      footer={
        isMobile ? (
          <PortfolioRewardsMobileTableFooter
            portfolioRewards={portfolioRewards}
          />
        ) : (
          <PortfolioRewardsTableFooter portfolioRewards={portfolioRewards} />
        )
      }
      footerStyle={(theme) => ({
        [theme.breakpoints.down('sm')]: {
          border: 'none',
        },
      })}
      headersStyle={{
        '& .MuiTableCell-root': {
          py: '6px',
          px: 2,
          textTransform: 'capitalize',
        },
      }}
    >
      {(data) =>
        data.map((portfolioReward, index) =>
          isMobile ? (
            <PortfolioRewardsMobileTableRow
              portfolioReward={portfolioReward}
              key={index}
            />
          ) : (
            <PortfolioRewardsTableRow
              portfolioReward={portfolioReward}
              key={index}
            />
          )
        )
      }
    </CustomTable>
  )
}

export default PortfolioRewardsTable
