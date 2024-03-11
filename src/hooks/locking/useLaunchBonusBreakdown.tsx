import { formatEther } from 'ethers/lib/utils'

import useUserLocks from '@/hooks/locking/useUserLocks'

import { toBigNumber } from '@/utils'

const useLaunchBonusBreakdown = () => {
  const { userLocks, error, isLoading } = useUserLocks()

  const totalLaunchBonus = userLocks
    ? formatEther(
        userLocks.reduce((acc, cur) => {
          return acc.add(toBigNumber(cur.launchBonus))
        }, toBigNumber('0'))
      )
    : undefined

  return {
    totalLaunchBonus,
    error,
    isLoading,
  }
}

export default useLaunchBonusBreakdown
