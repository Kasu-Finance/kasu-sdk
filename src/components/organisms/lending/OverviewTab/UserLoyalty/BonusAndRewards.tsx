'use client'

import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import InfoRow from '@/components/atoms/InfoRow'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type BonusAndRewardsProps = {
  pools: PoolOverviewWithDelegate[]
  poolId: string
  currentEpoch: string
}

const BonusAndRewards: React.FC<BonusAndRewardsProps> = ({
  pools,
  poolId,
  currentEpoch,
}) => {
  const { t } = getTranslation()

  const { stakedPercentage } = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const { isLoading, portfolioLendingPools } = useLendingPortfolioData(
    pools,
    currentEpoch
  )

  const { ksuPrice } = useKsuPrice()

  let lifetimeBonusYieldEarnings = '0'

  if (portfolioLendingPools) {
    const pool = portfolioLendingPools.find(
      (portfolioPool) => portfolioPool.id === poolId
    )

    if (pool) {
      lifetimeBonusYieldEarnings = pool.totalYieldEarningsLifetime
    }
  }

  const lifetimeYieldEarnedInUSD = convertToUSD(
    toBigNumber(lifetimeBonusYieldEarnings),
    parseEther(ksuPrice || '0')
  )
  return (
    <Grid container spacing={4}>
      <Grid item sm={6}>
        <InfoRow
          title={t('lending.poolOverview.lockingStatus.apyBonus.label')}
          toolTipInfo={t('lending.poolOverview.lockingStatus.apyBonus.tooltip')}
          showDivider
          metric={
            <Typography variant='baseMdBold'>
              {currentLevel === 1
                ? '0.1 %'
                : currentLevel === 2
                  ? '0.2 %'
                  : '0.00 %'}
            </Typography>
          }
        />
      </Grid>
      <Grid item sm={6}>
        <InfoRow
          title={t('lending.poolOverview.lockingStatus.lifeTimeBonus.label')}
          toolTipInfo={t(
            'lending.poolOverview.lockingStatus.lifeTimeBonus.tooltip'
          )}
          showDivider
          metric={
            isLoading ? (
              <Skeleton width={120} />
            ) : (
              <Box>
                <Typography variant='baseMdBold'>
                  {formatAmount(lifetimeBonusYieldEarnings)} KSU{' '}
                </Typography>
                <Typography variant='baseMd' color='gray.middle'>
                  ({formatAmount(formatEther(lifetimeYieldEarnedInUSD))}
                  USD)
                </Typography>
              </Box>
            )
          }
        />
      </Grid>
    </Grid>
  )
}

export default BonusAndRewards
