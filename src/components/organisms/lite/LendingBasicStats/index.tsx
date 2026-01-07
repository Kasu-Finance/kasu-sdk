import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { Box, Grid2, Typography } from '@mui/material'
import React from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'
import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import WaveBox from '@/components/atoms/WaveBox'
import LiteDailyInterestEarningsTooltip from '@/components/molecules/tooltips/Lite/LiteDailyInterestEarningsTooltip'
import LiteLifetimeInterestEarningsTooltip from '@/components/molecules/tooltips/Lite/LiteLifetimeInterestEarningsTooltip'
import LiteWeeklyInterestEarningsTooltip from '@/components/molecules/tooltips/Lite/LiteWeeklyInterestEarningsTooltip'
import DailyInterestEarnings from '@/components/organisms/lite/LendingBasicStats/DailyInterestEarnings'
import IncrementalLifetimeInterestEarnings from '@/components/organisms/lite/LendingBasicStats/IncrementalLifetimeInterestEarnings'
import LiteTotalLendingBalance from '@/components/organisms/lite/LendingBasicStats/LiteTotalLendingBalance'
import WeeklyInterestEarnings from '@/components/organisms/lite/LendingBasicStats/WeeklyInterestEarnings'

import { customPalette } from '@/themes/palette'

type LendingBasicStatsProps = {
  currentEpoch: string
  pools: PoolOverview[]
  portfolioLendingPools?: PortfolioLendingPool[]
  hasActiveDeposits?: boolean
  isPortfolioLoading?: boolean
}

const LendingBasicStats: React.FC<LendingBasicStatsProps> = ({
  currentEpoch,
  pools,
  portfolioLendingPools,
  hasActiveDeposits = true,
  isPortfolioLoading,
}) => {
  const shouldShowEmptyState = !isPortfolioLoading && !hasActiveDeposits

  if (shouldShowEmptyState) {
    return (
      <WaveBox borderRadius={4} p={4} variant='dark-middle'>
        <EmptyDataPlaceholder
          text='You have no active deposits yet.'
          textProps={{ color: 'white' }}
        />
      </WaveBox>
    )
  }

  return (
    <>
      <Grid2 container spacing={{ xs: 2, md: 3 }}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <WaveBox borderRadius={4} p={2} variant='dark-middle'>
            <Typography variant='baseMd' color='white'>
              Total Lending Balance
            </Typography>
            {/* <Box height={58} width='100%' />
            <DottedDivider color='white' /> */}
            <LiteTotalLendingBalance
              amountProps={{
                variant: 'h2',
              }}
              symbolProps={{
                color: 'white',
              }}
              skeletonProps={{
                sx: {
                  backgroundColor: customPalette.gold.dark,
                  mt: 2,
                },
                height: 42,
                width: 160,
              }}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <WaveBox borderRadius={4} p={2} variant='dark-middle'>
            <Box display='flex' alignItems='center'>
              <Typography variant='baseMd' color='white'>
                Lifetime Interest Earnings
              </Typography>
              <ToolTip
                title={<LiteLifetimeInterestEarningsTooltip />}
                iconSx={{
                  color: 'gold.dark',
                  '&:hover': {
                    color: 'gold.extraDark',
                  },
                }}
              />
            </Box>
            {/* <Box height={58} width='100%' />
            <DottedDivider color='white' /> */}
            <IncrementalLifetimeInterestEarnings
              poolOverviews={pools}
              currentEpoch={currentEpoch}
              portfolioLendingPools={portfolioLendingPools}
              amountProps={{
                variant: 'h2',
              }}
              symbolProps={{
                color: 'white',
              }}
              skeletonProps={{
                sx: {
                  backgroundColor: customPalette.gold.dark,
                  mt: 2,
                },
                height: 42,
                width: 160,
              }}
            />
          </WaveBox>
        </Grid2>
      </Grid2>
      <Grid2 container columnSpacing={{ xs: 0, md: 3 }}>
        <Grid2
          size={{ xs: 12, md: 6 }}
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          <DottedDivider />
        </Grid2>
        <Grid2
          size={{ xs: 12, md: 6 }}
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          <DottedDivider />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <InfoRow
            title='Weekly Interest Earnings'
            titleStyle={{ color: 'white' }}
            toolTipInfo={
              <ToolTip
                title={<LiteWeeklyInterestEarningsTooltip />}
                iconSx={{
                  color: 'gold.dark',
                  '&:hover': {
                    color: 'gold.extraDark',
                  },
                }}
              />
            }
            showDivider
            metric={
              <WeeklyInterestEarnings
                poolOverviews={pools}
                currentEpoch={currentEpoch}
                skeletonProps={{
                  sx: {
                    backgroundColor: customPalette.gold.dark,
                  },
                  height: 38,
                  width: 100,
                }}
              />
            }
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <InfoRow
            title='Daily Interest Earnings'
            titleStyle={{ color: 'white' }}
            toolTipInfo={
              <ToolTip
                title={<LiteDailyInterestEarningsTooltip />}
                iconSx={{
                  color: 'gold.dark',
                  '&:hover': {
                    color: 'gold.extraDark',
                  },
                }}
              />
            }
            showDivider
            metric={
              <DailyInterestEarnings
                poolOverviews={pools}
                currentEpoch={currentEpoch}
                skeletonProps={{
                  sx: {
                    backgroundColor: customPalette.gold.dark,
                  },
                  height: 38,
                  width: 100,
                }}
              />
            }
          />
        </Grid2>
      </Grid2>
    </>
  )
}

export default LendingBasicStats
