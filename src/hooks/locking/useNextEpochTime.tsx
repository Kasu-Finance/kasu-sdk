import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'

const useNextEpochTime = () => {
  const sdk = useSdk()
  const { currentChainId } = useChain()

  const { data, isLoading, error } = useSWR(
    sdk ? ['nextEpochTime', currentChainId] : null,
    async () => await sdk!.Locking.getNextEpochDate()
  )

  return {
    nextEpochTime: data || 0,
    error,
    isLoading,
  }
}

export default useNextEpochTime
