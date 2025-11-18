import { formatUnits } from 'ethers/lib/utils'
import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'

const useKsuPrice = () => {
  const sdk = useSdk()

  const { data, error, isLoading } = useSWR(
    sdk ? ['ksuPrice', sdk] : null,
    async ([_, sdk]) => sdk.Locking.getKasuTokenPrice()
  )

  return {
    ksuPrice: data ? formatUnits(data.price, data.decimals) : undefined,
    error,
    isLoading,
  }
}

export default useKsuPrice
