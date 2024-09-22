import { Grid } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import BonusRewardSummaryActions from '@/components/organisms/locking/BonusRewardSummary/BonusRewardSummaryActions'
import KsuBonusAndRewards from '@/components/organisms/locking/BonusRewardSummary/KsuBonusAndRewards'
import ProtocolFeeSharingBalance from '@/components/organisms/locking/BonusRewardSummary/ProtocolFeeSharingBalance'

const BonusRewardSummary = () => {
  const { t } = useTranslation()
  return (
    <CustomCard>
      <CustomCardHeader title={t('locking.widgets.rewardsSummary.title')} />
      <CustomInnerCardContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <InfoRow
              title={t('locking.widgets.rewardsSummary.metric-1')}
              toolTipInfo={t('locking.widgets.rewardsSummary.metric-1-tooltip')}
              showDivider
              metric={<ProtocolFeeSharingBalance />}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title={t('locking.widgets.rewardsSummary.metric-2')}
              toolTipInfo={
                <ToolTip
                  title={
                    <>
                      {t('locking.widgets.rewardsSummary.metric-2-toolip-1')}
                      <br />
                      <br />
                      {t('locking.widgets.rewardsSummary.metric-2-toolip-2')}
                      <br />
                      <br />
                      {t('locking.widgets.rewardsSummary.metric-2-toolip-3')}
                    </>
                  }
                />
              }
              showDivider
              metric={<KsuBonusAndRewards />}
            />
          </Grid>
          <BonusRewardSummaryActions />
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}
export default BonusRewardSummary
