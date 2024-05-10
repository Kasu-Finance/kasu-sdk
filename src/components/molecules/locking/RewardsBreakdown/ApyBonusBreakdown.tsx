import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useUserApyBonus from '@/hooks/locking/useUserApyBonus'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const ApyBonusBreakdown = () => {
  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)
  const { apyBonus } = useUserApyBonus()

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
          metric: [formatAmount(apyBonus?.balance.toString()), 'KSU'],
        },
        {
          title: 'Lifetime',
          toolTipInfo: 'info',
          metric: [formatAmount(apyBonus?.lifetime), 'KSU'],
        },
      ]}
    />
  )
}

export default ApyBonusBreakdown
