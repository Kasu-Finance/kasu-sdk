import LogoutIcon from '@mui/icons-material/Logout'
import { Card, CardContent, CardHeader } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from 'kasu-sdk/src/services/DataService/types'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import TranchInvestmentCard from '@/components/molecules/TranchInvestmentCard'

import { COLS } from '@/constants'
import { formatAmount, getAverageApyAndTotal } from '@/utils'

const InvestmentPortfolio: React.FC<{
  pool: PoolOverview
  poolDelegate: PoolDelegateProfileAndHistory
}> = ({ pool, poolDelegate }) => {
  const tranches = pool.tranches

  const tranchesTotal = getAverageApyAndTotal(tranches)

  console.warn('TODO: ', poolDelegate)

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title='Your Investment'
        titleTypographyProps={{
          variant: 'h6',
          component: 'h6',
          m: 0,
        }}
        action={
          <Button
            variant='outlined'
            sx={{ height: '30px', top: 4, right: 8 }}
            size='small'
          >
            View Portfolio
          </Button>
        }
      />
      <Grid container columnSpacing={3} rowGap={2} component={CardContent}>
        <Grid item xs={12}>
          <Box
            borderRadius={2}
            className='light-blue-background'
            sx={{
              flexGrow: 1,
              mt: 2,
              mb: 2,
            }}
          >
            <Grid
              container
              rowSpacing={1}
              width='100%'
              m={0}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            >
              <Grid item xs={4}>
                <MetricWithSuffix
                  content={formatAmount(tranchesTotal.totalCapacity, {
                    maxDecimals: 2,
                  })}
                  suffix='USDC'
                  tooltipKey='01'
                  titleKey='Total Amount Invested'
                />
              </Grid>
              <Grid item xs={4}>
                <MetricWithSuffix
                  content={
                    formatAmount(tranchesTotal.averageApy * 100, {
                      maxDecimals: 2,
                    }) + ' %'
                  }
                  tooltipKey='01'
                  titleKey='Weighted Average APY'
                />
              </Grid>
              <Grid item xs={4}>
                <MetricWithSuffix
                  content=' 2.4 %'
                  tooltipKey='01'
                  titleKey='Total Yield Earned'
                />
              </Grid>
            </Grid>
          </Box>{' '}
        </Grid>
        {tranches.map((tranche, index) => {
          return (
            <Grid item xs={COLS / pool.tranches.length} key={index}>
              <TranchInvestmentCard
                title={`${tranche.name} Tranche APY`}
                amount='300'
                apy={formatAmount(+tranche.apy * 100, { maxDecimals: 2 })}
                yieldEarned='dsds'
              />
            </Grid>
          )
        })}
      </Grid>
      <Box
        display='flex'
        justifyContent='center'
        width='100%'
        sx={{
          pt: 0,
          pl: 0,
          pr: 0,
          pb: 2,
        }}
      >
        <Button startIcon={<LogoutIcon />} variant='contained'>
          Withdraw
        </Button>
      </Box>
    </Card>
  )
}

export default InvestmentPortfolio
