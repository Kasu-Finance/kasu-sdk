'use client'

import { Grid, Skeleton } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'

import useUserLendingTrancheBalance from '@/hooks/lending/useUserLendingTrancheBalance'
import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import WaveCard from '@/components/molecules/WaveCard'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount } from '@/utils'
import { calculateUserLendingSummary } from '@/utils/lending/calculateUserBalances'

import { PoolOverviewWithDelegate } from '@/types/page'

type UserLendingSummaryProps = {
  pool: PoolOverviewWithDelegate
}

const UserLendingSummary: React.FC<UserLendingSummaryProps> = ({ pool }) => {
  const { t } = useTranslation()

  const { userLendingTrancheBalance, isLoading } =
    useUserLendingTrancheBalance(pool)

  const supportedToken = useSupportedTokenInfo()

  if (isLoading) {
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
    calculateUserLendingSummary(userLendingTrancheBalance ?? [])

  return (
    <Grid container spacing={4}>
      <Grid item sm={4}>
        <WaveCard
          title={t('lending.poolOverview.investmentCard.totalAmount.label')}
          toolTipInfo={t(
            'lending.poolOverview.investmentCard.totalAmount.tooltip'
          )}
          content={formatAmount(
            formatUnits(
              totalInvested,
              supportedToken?.[SupportedTokens.USDC].decimals
            )
          )}
          unit='USDC'
        />
      </Grid>
      <Grid item sm={4}>
        <WaveCard
          title={t('lending.poolOverview.investmentCard.weightedAvgApy.label')}
          toolTipInfo={t(
            'lending.poolOverview.investmentCard.weightedAvgApy.tooltip'
          )}
          content={(averageApy * 100).toFixed(2)}
          unit='%'
          infoColumnProps={{ titleStyle: { textTransform: 'capitalize' } }}
        />
      </Grid>
      <Grid item sm={4}>
        <WaveCard
          title={t('lending.poolOverview.investmentCard.totYieldEarned.label')}
          toolTipInfo={t(
            'lending.poolOverview.investmentCard.totYieldEarned.tooltip'
          )}
          content={formatAmount(totalYieldEarned)}
          unit='USDC'
        />
      </Grid>
    </Grid>
  )
}

export default UserLendingSummary
