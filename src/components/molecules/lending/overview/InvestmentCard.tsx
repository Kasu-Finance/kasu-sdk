'use client'

import { BigNumber } from '@ethersproject/bignumber'
import LogoutIcon from '@mui/icons-material/Logout'
import { Card, CardContent, CardHeader } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useGetUserBalance from '@/hooks/lending/useUserTrancheBalance'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import TranchInvestmentCard from '@/components/molecules/TranchInvestmentCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'
import { COLS } from '@/constants'
import {
  calculateTotalInvested,
  calculateTotalYieldEarned,
  formatAmount,
  getAverageApyAndTotal,
  getTranchesWithUserBalances,
  hexToUSD,
  sortTranches,
} from '@/utils'
import { TrancheWithUserBalance } from '@/utils/lending/calculateUserBalances'

const InvestmentPortfolio: React.FC<{
  pool: PoolOverview
}> = ({ pool }) => {
  const { openModal } = useModalState()
  const router = useRouter()
  const { account } = useWeb3React()
  const { data: userPoolBalance } = useUserPoolBalance(pool?.id)

  const tranches = pool.tranches.map((tranche) => tranche)
  const sortedTranches = sortTranches(tranches)
  const tranchesId = sortedTranches.map((tranche) => tranche.id)
  let tranchesWithBalances: TrancheWithUserBalance[] = []
  let totalYieldEarned: number = 0
  let totalInvestment: string = BigNumber.from('0x00').toString()

  const tranchesTotal = getAverageApyAndTotal(sortedTranches)
  const { amount, isLoading } = useGetUserBalance(tranchesId)

  if (!isLoading && amount) {
    tranchesWithBalances = getTranchesWithUserBalances(sortedTranches, amount)
    totalYieldEarned = calculateTotalYieldEarned(tranchesWithBalances)
    totalInvestment = calculateTotalInvested(tranchesWithBalances)
  }

  const isWithdrawDisabled = useMemo(() => {
    const hasNonZeroBalance =
      userPoolBalance && !userPoolBalance.balance.isZero()

    return !account || hasNonZeroBalance
  }, [userPoolBalance, account])

  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const handleWithdrawClick = (pool: PoolOverview) => {
    openModal({ name: ModalsKeys.WITHDRAW, poolData: pool })

    router.push(`${Routes.lending.root.url}/${pool.id}?step=1`)
  }

  return (
    <Card>
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
      <Grid
        container
        columnSpacing={3}
        rowGap={2}
        component={CardContent}
        direction={isMobile ? 'column' : 'row'}
      >
        <Grid item xs={12}>
          <Box
            borderRadius={2}
            className='light-colored-background'
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
                  content={formatAmount(totalInvestment.toString() || '0')}
                  suffix='USDC'
                  tooltipKey='lending.poolOverview.investmentCard.totalAmount.tooltip'
                  titleKey='lending.poolOverview.investmentCard.totalAmount.label'
                />
              </Grid>
              <Grid item xs={4}>
                <MetricWithSuffix
                  content={
                    formatAmount(tranchesTotal.averageApy * 100 || '0') + ' %'
                  }
                  tooltipKey='lending.poolOverview.investmentCard.weightedAvgApy.tooltip'
                  titleKey='lending.poolOverview.investmentCard.weightedAvgApy.label'
                />
              </Grid>
              <Grid item xs={4}>
                <MetricWithSuffix
                  content={formatAmount(totalYieldEarned || '0')}
                  suffix='USDC'
                  tooltipKey='lending.poolOverview.investmentCard.totYieldEarned.tooltip'
                  titleKey='lending.poolOverview.investmentCard.totYieldEarned.label'
                />
              </Grid>
            </Grid>
          </Box>{' '}
        </Grid>
        {tranchesWithBalances?.length > 1 &&
          tranchesWithBalances.map((tranche, index) => {
            const totalInvested = tranche?.balance
              ? hexToUSD(tranche.balance)
              : BigNumber.from('0x00').toString()

            return (
              <Grid item xs={COLS / tranchesWithBalances.length} key={index}>
                <TranchInvestmentCard
                  title={`${tranche.name} Tranche APY`}
                  amount={formatAmount(totalInvested || '0')}
                  apy={formatAmount(+tranche.apy * 100 || '0')}
                  yieldEarned={formatAmount(tranche.yieldEarned || '0')}
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
        <Button
          startIcon={<LogoutIcon />}
          onClick={() => handleWithdrawClick(pool)}
          variant='contained'
          disabled={isWithdrawDisabled}
        >
          Withdraw
        </Button>
      </Box>
    </Card>
  )
}

export default InvestmentPortfolio
