import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Grid2, Stack, Typography } from '@mui/material'

import DottedDivider from '@/components/atoms/DottedDivider'
import InfoRow from '@/components/atoms/InfoRow'
import WaveBox from '@/components/atoms/WaveBox'
import LifetimeFeesEarned from '@/components/organisms/portfolio/PortfolioSummary/LifetimeFeesEarned'
import LifetimeKsuBonusRewards from '@/components/organisms/portfolio/PortfolioSummary/LifetimeKsuBonusRewards'

import { customPalette } from '@/themes/palette'
import { formatAmount } from '@/utils'

type RewardsBasicStatsProps = {
  pools: PoolOverview[]
  currentEpoch: string
}

const RewardsBasicStats: React.FC<RewardsBasicStatsProps> = ({
  currentEpoch,
  pools,
}) => {
  return (
    <Stack spacing={3}>
      <Grid2 container spacing={3}>
        <Grid2 size={6}>
          <WaveBox borderRadius={4} p={2} variant='dark-middle'>
            <Typography variant='baseMd' color='white'>
              Lifetime Protocol Fees
            </Typography>
            <LifetimeFeesEarned
              poolOverviews={pools}
              currentEpoch={currentEpoch}
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
        <Grid2 size={6}>
          <WaveBox borderRadius={4} p={2} variant='dark-middle'>
            <Typography variant='baseMd' color='white'>
              Lifetime KASU Rewards
            </Typography>
            <LifetimeKsuBonusRewards
              poolOverviews={pools}
              currentEpoch={currentEpoch}
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
              showUsdAmout={false}
            />
          </WaveBox>
        </Grid2>
      </Grid2>
      <Grid2 container columnSpacing={3}>
        <Grid2 size={6}>
          <DottedDivider />
        </Grid2>
        <Grid2 size={6}>
          <DottedDivider />
        </Grid2>
        <Grid2 size={6}>
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
              <Typography variant='h3' color='gold.dark'>
                {formatAmount(250, { minDecimals: 2 })} USDC
              </Typography>
            }
          />
        </Grid2>
        <Grid2 size={6}>
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
              <Typography variant='h3' color='gold.dark'>
                {formatAmount(25, { minDecimals: 2 })} USDC
              </Typography>
            }
          />
        </Grid2>
      </Grid2>
    </Stack>
  )
}

export default RewardsBasicStats
