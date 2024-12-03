import { Grid } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import WaveBox from '@/components/atoms/WaveBox'
import LifetimeFeesEarned from '@/components/organisms/portfolio/PortfolioSummary/LifetimeFeesEarned'
import LifetimeInterestEarnings from '@/components/organisms/portfolio/PortfolioSummary/LifetimeInterestEarnings'
import LifetimeKsuBonusRewards from '@/components/organisms/portfolio/PortfolioSummary/LifetimeKsuBonusRewards'
import TotalKsuLocked from '@/components/organisms/portfolio/PortfolioSummary/TotalKsuLocked'
import TotalLendingBalance from '@/components/organisms/portfolio/PortfolioSummary/TotalLendingBalance'
import WeightedAverageApy from '@/components/organisms/portfolio/PortfolioSummary/WeightedAverageApy'

const PortfolioSummary = () => {
  const { t } = getTranslation()

  return (
    <Grid container spacing={4} mb={1}>
      <Grid item xs={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116}>
          <InfoColumn
            title={t('portfolio.summary.totalKsuLocked.title')}
            toolTipInfo={t('portfolio.summary.totalKsuLocked.tooltip')}
            metric={<TotalKsuLocked />}
          />
        </WaveBox>
      </Grid>
      <Grid item xs={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116}>
          <InfoColumn
            title={t('portfolio.summary.lendingPoolInvestment.title')}
            toolTipInfo={t('portfolio.summary.lendingPoolInvestment.tooltip')}
            metric={<TotalLendingBalance />}
          />
        </WaveBox>
      </Grid>
      <Grid item xs={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116}>
          <InfoColumn
            title={t('portfolio.summary.weightedApy.title')}
            toolTipInfo={t('portfolio.summary.weightedApy.tooltip')}
            metric={<WeightedAverageApy />}
          />
        </WaveBox>
      </Grid>
      <Grid item xs={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
          <InfoColumn
            title={t('portfolio.summary.yieldEarnings.title')}
            toolTipInfo={t('portfolio.summary.yieldEarnings.tooltip')}
            metric={<LifetimeInterestEarnings />}
          />
        </WaveBox>
      </Grid>
      <Grid item xs={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
          <InfoColumn
            title={t('portfolio.summary.ksuBonusRewards.title')}
            toolTipInfo={t('portfolio.summary.ksuBonusRewards.tooltip')}
            metric={<LifetimeKsuBonusRewards />}
          />
        </WaveBox>
      </Grid>
      <Grid item xs={4}>
        <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
          <InfoColumn
            title={t('portfolio.summary.protocolFeesEarned.title')}
            toolTipInfo={t('portfolio.summary.protocolFeesEarned.tooltip')}
            metric={<LifetimeFeesEarned />}
          />
        </WaveBox>
      </Grid>
    </Grid>
  )
}

export default PortfolioSummary
