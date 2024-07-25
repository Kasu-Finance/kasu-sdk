import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'
import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const FeesEarnedBreakdown = () => {
  const { t } = useTranslation()

  const { lockingRewards } = useLockingRewards()

  return (
    <RewardsBreakdownCard
      title={t('locking.widgets.rewardsBreakdown.rewards-3.title')}
      breakdowns={[
        {
          title: t('locking.widgets.rewardsBreakdown.rewards-3.metric-1'),
          toolTipInfo: (
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
          ),
          metric: [
            formatAmount(lockingRewards?.claimableRewards || '0'),
            'USDC',
          ],
        },

        {
          title: t('locking.widgets.rewardsBreakdown.rewards-3.metric-2'),
          toolTipInfo: (
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
          ),
          metric: [
            formatAmount(lockingRewards?.lifeTimeRewards || '0'),
            'USDC',
          ],
        },
      ]}
    />
  )
}

export default FeesEarnedBreakdown
