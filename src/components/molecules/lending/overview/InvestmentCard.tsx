import { BigNumber } from '@ethersproject/bignumber'
import LogoutIcon from '@mui/icons-material/Logout'
import { Card, CardContent, CardHeader } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import useGetUserBalance from '@/hooks/lending/useUserTrancheBalance'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import TranchInvestmentCard from '@/components/molecules/TranchInvestmentCard'

import { COLS } from '@/constants'
import {
  calculateTotalInvested,
  calculateTotalYieldEarned,
  formatAmount,
  getAverageApyAndTotal,
  getTranchesWithUserBalances,
} from '@/utils'

const InvestmentPortfolio: React.FC<{
  pool: PoolOverview
}> = ({ pool }) => {
  const tranches = pool.tranches.map((tranche) => tranche)
  const tranchesId = tranches.map((tranche) => tranche.id)
  let tranchesWithBalances = null
  let totalYieldEarned = 0
  let totalInvestment = BigNumber.from('0x00')

  const tranchesTotal = getAverageApyAndTotal(tranches)
  const { amount, isLoading } = useGetUserBalance(tranchesId)

  if (!isLoading && amount) {
    tranchesWithBalances = getTranchesWithUserBalances(tranches, amount)
    totalYieldEarned = calculateTotalYieldEarned(tranchesWithBalances)
    totalInvestment = calculateTotalInvested(tranchesWithBalances)
  }

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
                  content={formatAmount(totalInvestment)}
                  suffix='USDC'
                  tooltipKey='lending.poolOverview.investmentCard.totalAmount.tooltip'
                  titleKey='lending.poolOverview.investmentCard.totalAmount.label'
                />
              </Grid>
              <Grid item xs={4}>
                <MetricWithSuffix
                  content={formatAmount(tranchesTotal.averageApy * 100) + ' %'}
                  tooltipKey='lending.poolOverview.investmentCard.weightedAvgApy.tooltip'
                  titleKey='lending.poolOverview.investmentCard.weightedAvgApy.label'
                />
              </Grid>
              <Grid item xs={4}>
                <MetricWithSuffix
                  content={formatAmount(totalYieldEarned)}
                  suffix='USDC'
                  tooltipKey='lending.poolOverview.investmentCard.totYieldEarned.tooltip'
                  titleKey='lending.poolOverview.investmentCard.totYieldEarned.label'
                />
              </Grid>
            </Grid>
          </Box>{' '}
        </Grid>
        {tranchesWithBalances &&
          tranchesWithBalances.map((tranche, index) => {
            const totalInvested = tranche?.balance
              ? BigNumber.from(tranche.balance._hex)
              : BigNumber.from('0x00')

            return (
              <Grid item xs={COLS / tranchesWithBalances.length} key={index}>
                <TranchInvestmentCard
                  title={`${tranche.name} Tranche APY`}
                  amount={totalInvested.toString()}
                  apy={formatAmount(+tranche.apy * 100)}
                  yieldEarned={tranche.yieldEarned?.toString() || ''}
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
