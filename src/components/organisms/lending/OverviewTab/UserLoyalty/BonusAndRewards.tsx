'use client'

import { Box, Grid, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import InfoRow from '@/components/atoms/InfoRow'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type BonusAndRewardsProps = {
  poolId: string
}

const BonusAndRewards: React.FC<BonusAndRewardsProps> = ({ poolId }) => {
  const { t } = useTranslation()

  const { stakedPercentage } = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const { lendingPortfolioData } = useLendingPortfolioData()

  const { ksuPrice } = useKsuPrice()

  let lifetimeBonusYieldEarnings = '0'

  if (lendingPortfolioData) {
    const pool = lendingPortfolioData.lendingPools.find(
      (pool) => pool.id === poolId
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
            <Box>
              <Typography variant='baseMdBold'>
                {formatAmount(lifetimeBonusYieldEarnings)} KSU{' '}
              </Typography>
              <Typography variant='baseMd' color='gray.middle'>
                ({formatAmount(formatEther(lifetimeYieldEarnedInUSD))}
                USD)
              </Typography>
            </Box>
          }
        />
      </Grid>
    </Grid>
  )
}

export default BonusAndRewards
