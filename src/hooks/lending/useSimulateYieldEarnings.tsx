import { useCallback } from 'react'

import useSdk from '@/hooks/context/useSdk'

const useSimulateYieldEarnings = () => {
  const sdk = useSdk()

  return useCallback(
    (
      amount: number,
      interestRate: number,
      daysInvested: number,
      interestFee: number
    ) =>
      sdk
        ? sdk.DataService.calculateCompounding(
            amount,
            interestRate,
            daysInvested,
            interestFee
          )
        : [],
    [sdk]
  )
}

export default useSimulateYieldEarnings
