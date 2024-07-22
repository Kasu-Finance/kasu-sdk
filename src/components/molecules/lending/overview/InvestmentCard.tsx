'use client'

import { BigNumber } from '@ethersproject/bignumber'
import LogoutIcon from '@mui/icons-material/Logout'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import { Card, CardContent, CardHeader } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useWeb3React } from '@web3-react/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useUserPoolBalance from '@/hooks/lending/useUserPoolBalance'
import useGetUserBalance from '@/hooks/lending/useUserTrancheBalance'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
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
  const { t } = useTranslation()

  const { openModal } = useModalState()
  const router = useRouter()
  const { account } = useWeb3React()
  const { data: userPoolBalance } = useUserPoolBalance(pool?.id)
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

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

  const handleWithdrawClick = (pool: PoolOverview) => {
    openModal({ name: ModalsKeys.WITHDRAW, poolOverview: pool })

    router.push(`${Routes.lending.root.url}/${pool.id}?step=1`)
  }

  return (
    <Card
      sx={(theme) => ({
        [theme.breakpoints.down('sm')]: {
          mt: 2,
        },
      })}
    >
      <CardHeader
        title={t('lending.poolOverview.investmentCard.title')}
        titleTypographyProps={{
          variant: 'h6',
          component: 'h6',
          m: 0,
          fontSize: currentDevice === Device.MOBILE ? 16 : undefined,
        }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
        action={
          !isMobile &&
          account && (
            <Button
              variant='contained'
              sx={{ height: '30px', top: 4, right: 8 }}
              size='small'
              startIcon={<SpaceDashboardIcon />}
              LinkComponent={Link}
              href={Routes.portfolio.root.url}
            >
              View Portfolio
            </Button>
          )
        }
      />
      <Grid
        container
        columnSpacing={3}
        rowGap={2}
        component={CardContent}
        p={1}
        direction={isMobile ? 'column' : 'row'}
      >
        <Grid item xs={12}>
          <ColoredBox
            sx={(theme) => ({
              [theme.breakpoints.up('sm')]: { mt: 2, mb: 2 },
              [theme.breakpoints.down('sm')]: {
                background: 'transparent',
                p: 0,
              },
            })}
          >
            <Grid
              container
              rowSpacing={1}
              width='100%'
              m={0}
              columnSpacing={{ xs: 2, md: 3 }}
            >
              <Grid item xs={6} md={4}>
                <InfoColumn
                  showDivider
                  toolTipInfo={t(
                    'lending.poolOverview.investmentCard.totalAmount.tooltip'
                  )}
                  title={t(
                    'lending.poolOverview.investmentCard.totalAmount.label'
                  )}
                  titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                    },
                  })}
                  metric={
                    <TokenAmount
                      px={{ xs: 0, sm: 2 }}
                      py={{ xs: 0, sm: '6px' }}
                      amount={formatAmount(totalInvestment.toString() || '0')}
                      symbol='USDC'
                    />
                  }
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <InfoColumn
                  showDivider
                  toolTipInfo={t(
                    'lending.poolOverview.investmentCard.weightedAvgApy.tooltip'
                  )}
                  title={t(
                    tranches.length > 1
                      ? 'lending.poolOverview.investmentCard.weightedAvgApy.label'
                      : 'general.apy'
                  )}
                  titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                    },
                  })}
                  metric={
                    <TokenAmount
                      px={{ xs: 0, sm: 2 }}
                      py={{ xs: 0, sm: '6px' }}
                      amount={formatAmount(
                        tranchesTotal.averageApy * 100 || '0'
                      )}
                      symbol='%'
                    />
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <InfoColumn
                  showDivider
                  toolTipInfo={t(
                    'lending.poolOverview.investmentCard.totYieldEarned.tooltip'
                  )}
                  title={t(
                    'lending.poolOverview.investmentCard.totYieldEarned.label'
                  )}
                  titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                    },
                  })}
                  metric={
                    <TokenAmount
                      px={{ xs: 0, sm: 2 }}
                      py={{ xs: 0, sm: '6px' }}
                      amount={formatAmount(totalYieldEarned || '0')}
                      symbol='USDC'
                    />
                  }
                />
              </Grid>
            </Grid>
          </ColoredBox>
        </Grid>
        {tranchesWithBalances?.length > 1 &&
          tranchesWithBalances.map((tranche, index) => {
            const totalInvested = tranche?.balance
              ? hexToUSD(tranche.balance)
              : BigNumber.from('0x00').toString()

            return (
              <Grid item xs={COLS / tranchesWithBalances.length} key={index}>
                <TranchInvestmentCard
                  title={`${tranche.name} ${t('general.tranche')} ${t('general.apy')}`}
                  amount={formatAmount(totalInvested || '0')}
                  apy={formatAmount(+tranche.apy * 100 || '0')}
                  yieldEarned={formatAmount(tranche.yieldEarned || '0')}
                />
              </Grid>
            )
          })}
      </Grid>
      {!isMobile && (
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
            disabled={Boolean(isWithdrawDisabled)}
          >
            Withdraw
          </Button>
        </Box>
      )}
    </Card>
  )
}

export default InvestmentPortfolio
