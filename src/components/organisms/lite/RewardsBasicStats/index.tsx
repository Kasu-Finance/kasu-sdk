import { Grid2, Stack, Typography } from '@mui/material'

import DottedDivider from '@/components/atoms/DottedDivider'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import WaveBox from '@/components/atoms/WaveBox'

import { formatAmount } from '@/utils'

const RewardsBasicStats = () => {
  return (
    <Stack spacing={3}>
      <Grid2 container spacing={3}>
        <Grid2 size={6}>
          <WaveBox borderRadius={4} p={2} variant='dark-middle'>
            <Typography variant='baseMd' color='white'>
              Lifetime Protocol Fees
            </Typography>
            <TokenAmount
              amount={formatAmount(10_000, { minDecimals: 2 })}
              symbol='USDC'
              amountProps={{
                variant: 'h2',
              }}
              symbolProps={{
                color: 'white',
              }}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={6}>
          <WaveBox borderRadius={4} p={2} variant='dark-middle'>
            <Typography variant='baseMd' color='white'>
              Lifetime KASU Rewards
            </Typography>
            <TokenAmount
              amount={formatAmount(1_000, { minDecimals: 2 })}
              symbol='USDC'
              amountProps={{
                variant: 'h2',
              }}
              symbolProps={{
                color: 'white',
              }}
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
