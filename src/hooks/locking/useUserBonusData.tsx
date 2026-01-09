import type { KasuSdk } from '@kasufinance/kasu-sdk'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

type UseUserBonusDataOptions = {
  enabled?: boolean
  sdk?: KasuSdk
}

const useUserBonusData = (options?: UseUserBonusDataOptions) => {
  const sdkFromContext = useSdk()
  const sdk = options?.sdk ?? sdkFromContext
  const chainId = useChainId()
  const { address } = usePrivyAuthenticated()
  const addressLower = address?.toLowerCase()
  const enabled = options?.enabled ?? true

  const { data, error, isLoading, mutate } = useSWR(
    enabled && addressLower && sdk && chainId
      ? ['userBonusData', chainId, addressLower]
      : null,
    async ([_, __chainId, userAddress]) => {
      if (!sdk) throw new Error('SDK not ready')
      return await sdk.Locking.getUserBonusData(userAddress)
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    userBonus: data,
    error,
    isLoading: enabled && isLoading,
    updateUserBonus: mutate,
  }
}

export default useUserBonusData
