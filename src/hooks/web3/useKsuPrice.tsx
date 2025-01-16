import { formatUnits } from 'ethers/lib/utils'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useKsuPrice = () => {
  const sdk = useKasuSDK()

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
