import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

const ApyBonusBreakdown = () => {
  const stakedPercentage = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

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
          metric: ['1.00', 'KSU'],
        },
        {
          title: 'Lifetime',
          toolTipInfo: 'info',
          metric: ['2.00', 'KSU'],
        },
      ]}
    />
  )
}

export default ApyBonusBreakdown
