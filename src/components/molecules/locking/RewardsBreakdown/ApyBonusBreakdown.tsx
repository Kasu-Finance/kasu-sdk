import { useMemo } from 'react'

import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import RewardsBreakdownCard from '@/components/molecules/locking/RewardsBreakdown/RewardsBreakdownCard'

import { formatAmount } from '@/utils'

const ApyBonusBreakdown = () => {
  const stakedPercentage = useLockingPercentage()

  const { currentLevel } = useLoyaltyLevel(stakedPercentage)
  const { userLocks } = useUserLocks()

  const earningsData = useMemo(() => {
    if (!userLocks?.length) {
      return { yieldEarnings: '0.00', lockedAmount: '0.00' }
    }

    const totalLifetimeYieldEarnings = userLocks.reduce((sum, lock) => {
      const yieldEarnings = Number(lock?.lifetimeYieldEarnings || '0')
      return sum + yieldEarnings
    }, 0)

    const totalLockedAmount = userLocks.reduce((sum, lock) => {
      const lockedAmount = Number(lock?.lockedAmount || '0')
      return sum + lockedAmount
    }, 0)

    return {
      yieldEarnings: formatAmount(totalLifetimeYieldEarnings),
      lockedAmount: formatAmount(totalLockedAmount),
    }
  }, [userLocks])

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
          metric: [earningsData.lockedAmount, 'KSU'],
        },
        {
          title: 'Lifetime',
          toolTipInfo: 'info',
          metric: [earningsData.yieldEarnings, 'KSU'],
        },
      ]}
    />
  )
}

export default ApyBonusBreakdown
