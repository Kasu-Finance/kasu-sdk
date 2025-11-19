import { ethers } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'

import useSdk from '@/hooks/context/useSdk'

const useCalculateLaunchBonusAmount = (
  lockAmount: string,
  bonusMultiplier: number,
  bonusTokensLeft: string
) => {
  const sdk = useSdk()

  const bonusAmount = sdk
    ? sdk.Locking.getLaunchBonusAmount(
        parseEther(lockAmount),
        bonusMultiplier,
        parseEther(bonusTokensLeft)
      )
    : ethers.constants.Zero

  return formatEther(bonusAmount)
}

export default useCalculateLaunchBonusAmount
