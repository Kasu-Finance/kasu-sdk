import { Grid2 } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import WaveBox from '@/components/atoms/WaveBox'
import LifetimeFeesEarned from '@/components/organisms/portfolio/PortfolioSummary/LifetimeFeesEarned'
import LifetimeInterestEarnings from '@/components/organisms/portfolio/PortfolioSummary/LifetimeInterestEarnings'
import LifetimeKsuBonusRewards from '@/components/organisms/portfolio/PortfolioSummary/LifetimeKsuBonusRewards'
import TotalKsuLocked from '@/components/organisms/portfolio/PortfolioSummary/TotalKsuLocked'
import TotalLendingBalance from '@/components/organisms/portfolio/PortfolioSummary/TotalLendingBalance'
import WeightedAverageApy from '@/components/organisms/portfolio/PortfolioSummary/WeightedAverageApy'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolOverview } from '@/app/_requests/pools'

const PortfolioSummary = async () => {
  const [currentEpoch, poolOverviews] = await Promise.all([
    getCurrentEpoch(),
    getPoolOverview(),
  ])

  const { t } = getTranslation()

  return (
    <Grid2 container spacing={4} mb={1}>
      <Grid2 size={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116}>
          <InfoColumn
            title={t('portfolio.summary.totalKsuLocked.title')}
            toolTipInfo={t('portfolio.summary.totalKsuLocked.tooltip')}
            metric={
              <TotalKsuLocked
                currentEpoch={currentEpoch}
                poolOverviews={poolOverviews}
                key='totalKsuLocked'
              />
            }
          />
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116}>
          <InfoColumn
            title={t('portfolio.summary.lendingPoolInvestment.title')}
            toolTipInfo={t('portfolio.summary.lendingPoolInvestment.tooltip')}
            metric={
              <TotalLendingBalance
                currentEpoch={currentEpoch}
                poolOverviews={poolOverviews}
                key='totalLendingBalance'
              />
            }
          />
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116}>
          <InfoColumn
            title={t('portfolio.summary.weightedApy.title')}
            toolTipInfo={t('portfolio.summary.weightedApy.tooltip')}
            metric={
              <WeightedAverageApy
                currentEpoch={currentEpoch}
                poolOverviews={poolOverviews}
                key='weightedAverageApy'
              />
            }
          />
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
          <InfoColumn
            title={t('portfolio.summary.yieldEarnings.title')}
            toolTipInfo={t('portfolio.summary.yieldEarnings.tooltip')}
            metric={
              <LifetimeInterestEarnings
                currentEpoch={currentEpoch}
                poolOverviews={poolOverviews}
                key='lifetimeInterestEarnings'
              />
            }
          />
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
          <InfoColumn
            title={t('portfolio.summary.ksuBonusRewards.title')}
            toolTipInfo={t('portfolio.summary.ksuBonusRewards.tooltip')}
            metric={
              <LifetimeKsuBonusRewards
                currentEpoch={currentEpoch}
                poolOverviews={poolOverviews}
                key='lifetimeKsuBonusRewards'
              />
            }
          />
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
          <InfoColumn
            title={t('portfolio.summary.protocolFeesEarned.title')}
            toolTipInfo={t('portfolio.summary.protocolFeesEarned.tooltip')}
            metric={
              <LifetimeFeesEarned
                currentEpoch={currentEpoch}
                poolOverviews={poolOverviews}
                key='lifetimeFeesEarned'
              />
            }
          />
        </WaveBox>
      </Grid2>
    </Grid2>
  )
}

export default PortfolioSummary
