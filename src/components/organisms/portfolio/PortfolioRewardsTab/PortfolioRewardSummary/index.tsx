import { Divider, Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import InfoRow from '@/components/atoms/InfoRow'
import ClaimableKsuBonusRewards from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardSummary/ClaimableKsuBonusRewards'
import ClaimableProtocolFees from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardSummary/ClaimbleProtocolFees'
import LifetimeKsuBonusRewards from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardSummary/LifetimeKsuBonusRewards'
import LiftimeProtocolFees from '@/components/organisms/portfolio/PortfolioRewardsTab/PortfolioRewardSummary/LifetimeProtocolFees'

const PortfolioRewardSummary = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <CustomCardHeader title={t('portfolio.rewards.title-1')} />
      <CustomInnerCardContent sx={{ pt: 5, pb: 3 }}>
        <Grid container columnSpacing={4}>
          <Grid item xs={6}>
            <Typography variant='h5'>
              {t('portfolio.rewards.totalUsdcBonus')}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
            <InfoRow
              title={t('portfolio.rewards.claimableBalance')}
              toolTipInfo='info'
              metric={<ClaimableProtocolFees />}
              showDivider
            />
            <InfoRow
              title={t('portfolio.rewards.lifetimeRewards')}
              toolTipInfo='info'
              metric={<LiftimeProtocolFees />}
              showDivider
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant='h5'>
              {t('portfolio.rewards.totalKsuBonus')}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
            <InfoRow
              title={t('portfolio.rewards.claimableBalance')}
              toolTipInfo='info'
              metric={<ClaimableKsuBonusRewards />}
              showDivider
            />
            <InfoRow
              title={t('portfolio.rewards.lifetimeRewards')}
              toolTipInfo='info'
              metric={<LifetimeKsuBonusRewards />}
              showDivider
            />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default PortfolioRewardSummary
