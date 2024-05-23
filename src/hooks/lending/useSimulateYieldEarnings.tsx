import { useCallback } from 'react'

import useKasuSDK from '@/hooks/useKasuSDK'

const useSimulateYieldEarnings = () => {
  const sdk = useKasuSDK()

  return useCallback(
    (amount: number, apy: number, days: number) =>
      sdk.DataService.calculateCompounding(amount, apy, days),
    [sdk]
  )
}

export default useSimulateYieldEarnings
