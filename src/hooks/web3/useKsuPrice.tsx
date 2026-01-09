import type { KasuSdk } from '@kasufinance/kasu-sdk'
import { formatUnits } from 'ethers/lib/utils'
import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'

type UseKsuPriceOptions = {
  enabled?: boolean
  sdk?: KasuSdk
}

const useKsuPrice = (options?: UseKsuPriceOptions) => {
  const sdkFromContext = useSdk()
  const sdk = options?.sdk ?? sdkFromContext
  const enabled = options?.enabled ?? true

  const { data, error, isLoading } = useSWR(
    enabled && sdk ? ['ksuPrice', sdk] : null,
    async ([_, sdk]) => sdk.Locking.getKasuTokenPrice()
  )

  return {
    ksuPrice: data ? formatUnits(data.price, data.decimals) : undefined,
    error,
    isLoading: enabled && isLoading,
  }
}

export default useKsuPrice
