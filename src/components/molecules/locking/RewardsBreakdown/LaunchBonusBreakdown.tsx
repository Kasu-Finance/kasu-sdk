import useLaunchBonusBreakdown from '@/hooks/locking/useLaunchBonusBreakdown'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const LaunchBonusBreakdown = () => {
  const { totalLaunchBonus } = useLaunchBonusBreakdown()

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
