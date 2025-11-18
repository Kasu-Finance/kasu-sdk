import { useCallback } from 'react'

import useSdk from '@/hooks/context/useSdk'

const useSimulateBonusYieldEarnings = () => {
  const sdk = useSdk()

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
