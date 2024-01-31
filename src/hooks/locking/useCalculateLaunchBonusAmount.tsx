import { formatEther, parseEther } from 'ethers/lib/utils'

import useKasuSDK from '@/hooks/useKasuSDK'

const useCalculateLaunchBonusAmount = (
  lockAmount: string,
  bonusMultiplier: number,
  bonusTokensLeft: string
) => {
  const sdk = useKasuSDK()

  const bonusAmount = sdk.Locking.getLaunchBonusAmount(
    parseEther(lockAmount),
    bonusMultiplier,
    parseEther(bonusTokensLeft)
  )

  return formatEther(bonusAmount)
}

export default useCalculateLaunchBonusAmount
