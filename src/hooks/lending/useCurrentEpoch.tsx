import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'

/**
 * Hook to fetch the current epoch for the current chain.
 * Use this for client-side epoch fetching when server-side props
 * don't match the current chain.
 */
const useCurrentEpoch = () => {
  const sdk = useSdk()
  const { currentChainId } = useChain()

  const { data, error, isLoading } = useSWR(
    sdk && currentChainId ? ['currentEpoch', currentChainId] : null,
    async () => {
      if (!sdk) throw new Error('SDK not ready')
      return sdk.UserLending.getCurrentEpoch()
    },
    {
      revalidateIfStale: false,
    }
  )

  return {
    currentEpoch: data,
    error,
    isLoading,
  }
}

export default useCurrentEpoch
