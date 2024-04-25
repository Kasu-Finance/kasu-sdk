'use client'

import { Grid, Typography } from '@mui/material'

import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount, formatPercentage } from '@/utils'

const CurrentSummary = () => {
  return (
    <Grid item xs={6} container spacing={2} mt='auto'>
      <Grid item xs={4}>
        <InfoColumn
          title='Total KSU Locked'
          toolTipInfo='info'
          showDivider
          titleStyle={{ whiteSpace: 'nowrap' }}
          metric={
            <TokenAmount
              amount={formatAmount(100_000)}
              symbol='KSU'
              usdValue={formatAmount(200_000)}
              pt='6px'
              pl={2}
            />
          }
        />
      </Grid>
      <Grid item xs={4}>
        <InfoColumn
          title='Lending Pool Investments'
          toolTipInfo='info'
          showDivider
          titleStyle={{ whiteSpace: 'nowrap' }}
          metric={
            <TokenAmount
              amount={formatAmount(30_000)}
              symbol='USDC'
              pt='6px'
              pl={2}
            />
          }
        />
      </Grid>
      <Grid item xs={4}>
        <InfoColumn
          title='Weighted Average APY'
          toolTipInfo='info'
          showDivider
          titleStyle={{ whiteSpace: 'nowrap' }}
          metric={
            <Typography
              variant='h6'
              component='span'
              display='block'
              pt='6px'
              pl={2}
            >
              {formatPercentage(0.105)}
            </Typography>
          }
        />
      </Grid>
    </Grid>
  )
}

export default CurrentSummary
