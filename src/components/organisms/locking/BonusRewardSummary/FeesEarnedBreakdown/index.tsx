import { Box, Divider, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import ClaimableFeesBalance from '@/components/organisms/locking/BonusRewardSummary/FeesEarnedBreakdown/ClaimableFeesBalance'
import ClaimFeesButton from '@/components/organisms/locking/BonusRewardSummary/FeesEarnedBreakdown/ClaimFeesButton'
import LifetimeFeesEarned from '@/components/organisms/locking/BonusRewardSummary/FeesEarnedBreakdown/LifetimeFeesEarned'

const FeesEarnedBreakdown = () => {
  const { t } = useTranslation()

  return (
    <Box height='100%' display='flex' flexDirection='column'>
      <Typography variant='h5'>
        {t('locking.widgets.rewardsBreakdown.rewards-3.title')}
      </Typography>
      <Divider sx={{ mt: 1.5 }} />
      <InfoRow
        title={t('locking.widgets.rewardsBreakdown.rewards-3.metric-1')}
        toolTipInfo={
          <ToolTip
            title={
              <>
                {t(
                  'locking.widgets.rewardsBreakdown.rewards-3.metric-1-tooltip-1'
                )}
                <br />
                <br />
                {t(
                  'locking.widgets.rewardsBreakdown.rewards-3.metric-1-tooltip-2'
                )}
              </>
            }
          />
        }
        metric={<ClaimableFeesBalance />}
        showDivider
      />
      <InfoRow
        title={t('general.lifetime')}
        titleStyle={{ textTransform: 'capitalize' }}
        toolTipInfo={
          <ToolTip
            title={
              <>
                {t(
                  'locking.widgets.rewardsBreakdown.rewards-3.metric-2-tooltip-1'
                )}
                <br />
                <br />
                {t(
                  'locking.widgets.rewardsBreakdown.rewards-3.metric-2-tooltip-2'
                )}
              </>
            }
          />
        }
        metric={<LifetimeFeesEarned />}
      />
      <ClaimFeesButton />
    </Box>
  )
}

export default FeesEarnedBreakdown
