import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const ApyBonusBreakdown = () => {
  const stakedPercentage = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)
  const { userLocks } = useUserLocks()

  return (
    <RewardsBreakdownCard
      title='Reward 1 • APY Bonus'
      subtitle='(Paid in KSU)'
      breakdowns={[
        {
          title: 'APY Bonus Based on Loyalty Level',
          toolTipInfo: 'info',
          metric: [
            currentLevel === 1 ? '0.1%' : currentLevel === 2 ? '0.2%' : 'None',
          ],
        },
        {
          title: 'Balance',
          toolTipInfo: 'info',
          metric: ['0.00', 'KSU'],
        },
        {
          title: 'Lifetime',
          toolTipInfo: 'info',
          metric: [
            formatAmount(userLocks?.lifetimeYieldEarnings, { minDecimals: 2 }),
            'KSU',
          ],
        },
      ]}
    />
  )
}

export default ApyBonusBreakdown
