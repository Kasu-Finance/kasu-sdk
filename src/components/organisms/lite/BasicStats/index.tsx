import { Box, Grid2, Typography } from '@mui/material'

import DottedDivider from '@/components/atoms/DottedDivider'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import WaveBox from '@/components/atoms/WaveBox'

import { formatAmount } from '@/utils'

const BasicStats = () => {
  return (
    <>
      <Grid2 container spacing={3}>
        <Grid2 size={6}>
          <WaveBox borderRadius={4} p={2} variant='dark-middle'>
            <Typography variant='baseMd' color='white'>
              Total Lending Balance
            </Typography>
            <Box height={58} width='100%' />
            <DottedDivider color='white' />
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
              Lifetime Interest Earnings
            </Typography>
            <Box height={58} width='100%' />
            <DottedDivider color='white' />
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
            title='Weekly Interest Earnings'
            titleStyle={{ color: 'white' }}
            toolTipInfo='info'
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
            title='Daily Interest Earnings'
            titleStyle={{ color: 'white' }}
            toolTipInfo='info'
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
    </>
  )
}

export default BasicStats
