import { useCallback } from 'react'

import useKasuSDK from '@/hooks/useKasuSDK'

const useSimulateBonusYieldEarnings = () => {
  const sdk = useKasuSDK()

  return useCallback(
    (earnedAmounts: number[], amount: number, bonusEpochInterest: number) =>
      sdk
        ? sdk.DataService.calculateBonusInterestEarnings(
            earnedAmounts,
            amount,
            bonusEpochInterest
          )
        : [0],
    [sdk]
  )
}

export default useSimulateBonusYieldEarnings
