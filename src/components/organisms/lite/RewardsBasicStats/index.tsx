import { Grid2, Stack, Typography } from '@mui/material'

import DottedDivider from '@/components/atoms/DottedDivider'
import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import InfoRow from '@/components/atoms/InfoRow'
import WaveBox from '@/components/atoms/WaveBox'
import LiteLifetimeFeesEarned from '@/components/organisms/lite/RewardsBasicStats/LiteLifetimeFeesEarned'
import LiteLifetimeKsuBonusRewards from '@/components/organisms/lite/RewardsBasicStats/LiteLifetimeKsuBonusRewards'
import WeeklyKsuRewards from '@/components/organisms/lite/RewardsBasicStats/WeeklyKsuRewards'
import WeeklyProtocolFees from '@/components/organisms/lite/RewardsBasicStats/WeeklyProtocolFees'

import { customPalette } from '@/themes/palette'

type RewardsBasicStatsProps = {
  hasActiveDeposits?: boolean
  isPortfolioLoading?: boolean
}

const RewardsBasicStats: React.FC<RewardsBasicStatsProps> = ({
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
    <Stack spacing={3}>
      <Grid2 container spacing={{ xs: 2, md: 3 }}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <WaveBox borderRadius={4} p={2} variant='dark-middle'>
            <Typography variant='baseMd' color='white'>
              Lifetime Protocol Fees
            </Typography>
            <LiteLifetimeFeesEarned
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
            <Typography variant='baseMd' color='white'>
              Lifetime KASU Rewards
            </Typography>
            <LiteLifetimeKsuBonusRewards
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
            title='Weekly Protocol Fees'
            titleStyle={{ color: 'white' }}
            toolTipInfo='The amount of Protocol Fees you are expected to earn for the current 7-day epoch, based on your Kasu Loyalty Level.'
            toolTipProps={{
              iconSx: {
                color: 'gold.dark',
                '&:hover': {
                  color: 'gold.extraDark',
                },
              },
            }}
            showDivider
            metric={
              <WeeklyProtocolFees
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
            title='Weekly KASU Rewards'
            titleStyle={{ color: 'white' }}
            toolTipInfo='The amount of KASU Rewards you are expected to earn for the current 7-day epoch. See below Rewards Portfolio for a full breakdown.'
            toolTipProps={{
              iconSx: {
                color: 'gold.dark',
                '&:hover': {
                  color: 'gold.extraDark',
                },
              },
            }}
            showDivider
            metric={
              <WeeklyKsuRewards
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
    </Stack>
  )
}

export default RewardsBasicStats
