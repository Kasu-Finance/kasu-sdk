import useEarnedBonusLockingAmount from '@/hooks/locking/useEarnedBonusLockingAmount'
import useTranslation from '@/hooks/useTranslation'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const LaunchBonusBreakdown = () => {
  const { t } = useTranslation()

  const { totalLaunchBonus } = useEarnedBonusLockingAmount()

  return (
    <RewardsBreakdownCard
      title={t('locking.widgets.rewardsBreakdown.rewards-2.title')}
      breakdowns={[
        {
          title: t('locking.widgets.rewardsBreakdown.rewards-2.metric'),
          toolTipInfo: t(
            'locking.widgets.rewardsBreakdown.rewards-2.metric-tooltip'
          ),
          metric: [formatAmount(totalLaunchBonus || '0'), 'KSU'],
        },
      ]}
    />
  )
}

export default LaunchBonusBreakdown
