'use client'

import { Divider, Grid, Typography } from '@mui/material'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

const LifetimeSummary = () => {
  return (
    <Grid item xs={6}>
      <ColoredBox sx={{ p: 0 }}>
        <Typography
          variant='caption'
          component='span'
          textAlign='center'
          width='100%'
          display='block'
          py='6px'
        >
          Lifetime
        </Typography>
        <Divider />
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <InfoColumn
              title='Yield Earnings'
              toolTipInfo='info'
              showDivider
              metric={
                <TokenAmount
                  amount={formatAmount(1_000)}
                  symbol='USDC'
                  pt='6px'
                  pl={2}
                />
              }
            />
          </Grid>
          <Grid item xs={4}>
            <InfoColumn
              title='KSU Bonus & Rewards'
              toolTipInfo='info'
              titleStyle={{ whiteSpace: 'nowrap' }}
              showDivider
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
              title='Protocol Fees Earned'
              toolTipInfo='info'
              titleStyle={{ whiteSpace: 'nowrap' }}
              showDivider
              metric={
                <TokenAmount
                  amount={formatAmount(1_000)}
                  symbol='USDC'
                  pt='6px'
                  pl={2}
                />
              }
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </Grid>
  )
}

export default LifetimeSummary
