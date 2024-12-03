'use client'

import { Grid, Skeleton } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'

import useCurrentFtdBalance from '@/hooks/lending/useCurrentFtdBalance'
import useUserLendingTrancheBalance from '@/hooks/lending/useUserLendingTrancheBalance'
import getTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'
import LifetimeInterestEarnedTooltip from '@/components/molecules/tooltips/LifetimeInterestEarnedTooltip'
import WeightedAverageApyTooltip from '@/components/molecules/tooltips/WeightAverageApyTooltip'
import WaveCard from '@/components/molecules/WaveCard'

import { calculateUserLendingSummary, formatAmount } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type UserLendingSummaryProps = {
  pool: PoolOverviewWithDelegate
}

const UserLendingSummary: React.FC<UserLendingSummaryProps> = ({ pool }) => {
  const { t } = getTranslation()

  const { userLendingTrancheBalance, isLoading } = useUserLendingTrancheBalance(
    pool.id,
    pool.tranches
  )

  const { currentFtdBalance, isLoading: currentFtdBalanceLoading } =
    useCurrentFtdBalance(pool.id)

  if (isLoading || currentFtdBalanceLoading || !currentFtdBalance) {
    return (
      <Grid container spacing={4}>
        <Grid item flex={1}>
          <Skeleton variant='rounded' height={122} />
        </Grid>
        <Grid item flex={1}>
          <Skeleton variant='rounded' height={122} />
        </Grid>
        <Grid item flex={1}>
          <Skeleton variant='rounded' height={122} />
        </Grid>
      </Grid>
    )
  }

  const { totalInvested, totalYieldEarned, averageApy } =
    calculateUserLendingSummary(
      userLendingTrancheBalance ?? [],
      currentFtdBalance
    )

  return (
    <Grid container spacing={4}>
      <Grid item sm={4}>
        <WaveCard
          title={t('lending.poolOverview.investmentCard.totalAmount.label')}
          toolTipInfo={t(
            'lending.poolOverview.investmentCard.totalAmount.tooltip'
          )}
          content={formatAmount(formatUnits(totalInvested))}
          unit='USDC'
        />
      </Grid>
      <Grid item sm={4}>
        <WaveCard
          title={t('lending.poolOverview.investmentCard.weightedAvgApy.label')}
          toolTipInfo={<ToolTip title={<WeightedAverageApyTooltip />} />}
          content={(averageApy * 100).toFixed(2)}
          unit='%'
          infoColumnProps={{ titleStyle: { textTransform: 'capitalize' } }}
        />
      </Grid>
      <Grid item sm={4}>
        <WaveCard
          title={t('lending.poolOverview.investmentCard.totYieldEarned.label')}
          toolTipInfo={<ToolTip title={<LifetimeInterestEarnedTooltip />} />}
          content={formatAmount(totalYieldEarned)}
          unit='USDC'
        />
      </Grid>
    </Grid>
  )
}

export default UserLendingSummary
