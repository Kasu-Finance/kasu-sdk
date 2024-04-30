import useLockingRewards from '@/hooks/locking/useLockingRewards'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const FeesEarnedBreakdown = () => {
  const { lockingRewards } = useLockingRewards()

  return (
    <RewardsBreakdownCard
      title='Reward 3 • Protocol Fee Sharing'
      breakdowns={[
        {
          title: 'Claimable Balance',
          toolTipInfo: 'info',
          metric: [formatAmount(lockingRewards?.claimableRewards), 'USDC'],
        },

        {
          title: 'Lifetime Protocol Fees',
          toolTipInfo: 'info',
          metric: [formatAmount(lockingRewards?.lifeTimeRewards), 'USDC'],
        },
      ]}
    />
  )
}

export default FeesEarnedBreakdown
