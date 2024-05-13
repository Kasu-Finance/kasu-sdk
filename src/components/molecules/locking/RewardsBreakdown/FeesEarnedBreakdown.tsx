import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useTranslation from '@/hooks/useTranslation'

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
          toolTipInfo: t(
            'locking.widgets.rewardsBreakdown.rewards-3.metric-1-tooltip'
          ),
          metric: [formatAmount(lockingRewards?.claimableRewards), 'USDC'],
        },

        {
          title: t('locking.widgets.rewardsBreakdown.rewards-3.metric-2'),
          toolTipInfo: t(
            'locking.widgets.rewardsBreakdown.rewards-3.metric-2-tooltip'
          ),
          metric: [formatAmount(lockingRewards?.lifeTimeRewards), 'USDC'],
        },
      ]}
    />
  )
}

export default FeesEarnedBreakdown
