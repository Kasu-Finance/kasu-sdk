import { ethers } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCalculateLaunchBonusAmount = (
  lockAmount: string,
  bonusMultiplier: number,
  bonusTokensLeft: string
) => {
  const sdk = useKasuSDK()

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
