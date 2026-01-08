import getTranslation from '@/hooks/useTranslation'

import PortfolioSummaryClient from '@/components/organisms/portfolio/PortfolioSummary/PortfolioSummaryClient'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolOverview } from '@/app/_requests/pools'

const PortfolioSummary = async () => {
  const [currentEpoch, poolOverviews] = await Promise.all([
    getCurrentEpoch(),
    getPoolOverview(),
  ])

  const { t } = getTranslation()

  return (
    <PortfolioSummaryClient
      currentEpoch={currentEpoch}
      poolOverviews={poolOverviews}
      titleMap={{
        totalKsuLocked: t('portfolio.summary.totalKsuLocked.title'),
        totalKsuLockedTooltip: t('portfolio.summary.totalKsuLocked.tooltip'),
        totalLendingBalance: t('portfolio.summary.lendingPoolInvestment.title'),
        totalLendingBalanceTooltip: t(
          'portfolio.summary.lendingPoolInvestment.tooltip'
        ),
        weightedAverageApy: t('portfolio.summary.weightedApy.title'),
        weightedAverageApyTooltip: t('portfolio.summary.weightedApy.tooltip'),
        lifetimeInterestEarnings: t('portfolio.summary.yieldEarnings.title'),
        lifetimeInterestEarningsTooltip: t(
          'portfolio.summary.yieldEarnings.tooltip'
        ),
        lifetimeKsuBonusRewards: t('portfolio.summary.ksuBonusRewards.title'),
        lifetimeKsuBonusRewardsTooltip: t(
          'portfolio.summary.ksuBonusRewards.tooltip'
        ),
        lifetimeFeesEarned: t('portfolio.summary.protocolFeesEarned.title'),
        lifetimeFeesEarnedTooltip: t(
          'portfolio.summary.protocolFeesEarned.tooltip'
        ),
      }}
    />
  )
}

export default PortfolioSummary
