import useEarnedBonusLockingAmount from '@/hooks/locking/useEarnedBonusLockingAmount'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const LaunchBonusBreakdown = () => {
  const { totalLaunchBonus } = useEarnedBonusLockingAmount()

  return (
    <RewardsBreakdownCard
      title='Reward 2 • KSU Launch Bonus'
      breakdowns={[
        {
          title: 'Your Total Launch Bonus',
          toolTipInfo: 'info',
          metric: [
            formatAmount(totalLaunchBonus ?? '0', { minDecimals: 2 }),
            'KSU',
          ],
        },
      ]}
    />
  )
}

export default LaunchBonusBreakdown
