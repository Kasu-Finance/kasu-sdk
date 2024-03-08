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
          metric: [
            formatAmount(lockingRewards?.claimableRewards ?? '0', {
              minDecimals: 2,
            }),
            'USDC',
          ],
        },

        {
          title: 'Lifetime Protocol Fees',
          toolTipInfo: 'info',
          metric: [
            formatAmount(lockingRewards?.lifeTimeRewards ?? '0', {
              minDecimals: 2,
            }),
            'USDC',
          ],
        },
      ]}
    />
  )
}

export default FeesEarnedBreakdown
