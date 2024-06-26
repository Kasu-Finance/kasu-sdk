import { useCallback } from 'react'

import useKasuSDK from '@/hooks/useKasuSDK'

const useSimulateBonusYieldEarnings = () => {
  const sdk = useKasuSDK()

  return useCallback(
    (earnedAmounts: number[], amount: number, bonusEpochInterest: number) =>
      sdk.DataService.calculateBonusInterestEarnings(
        earnedAmounts,
        amount,
        bonusEpochInterest
      ),
    [sdk]
  )
}

export default useSimulateBonusYieldEarnings
