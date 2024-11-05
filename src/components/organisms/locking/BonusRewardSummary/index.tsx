import { Grid } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import ApyBonusBreakdown from '@/components/organisms/locking/BonusRewardSummary/ApyBonusBreakdown'
import FeesEarnedBreakdown from '@/components/organisms/locking/BonusRewardSummary/FeesEarnedBreakdown'
import LaunchBonusBreakdown from '@/components/organisms/locking/BonusRewardSummary/LaunchBonusBreakdown'

const BonusRewardSummary = () => {
  const { t } = getTranslation()
  return (
    <CustomCard>
      <CustomCardHeader title={t('locking.widgets.rewardsSummary.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <ApyBonusBreakdown />
          </Grid>
          <Grid item xs={4}>
            <LaunchBonusBreakdown />
          </Grid>
          <Grid item xs={4}>
            <FeesEarnedBreakdown />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}
export default BonusRewardSummary
