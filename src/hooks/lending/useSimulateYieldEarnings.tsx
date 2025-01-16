import { useCallback } from 'react'

import useKasuSDK from '@/hooks/useKasuSDK'

const useSimulateYieldEarnings = () => {
  const sdk = useKasuSDK()

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
