import useSWRImmutable from 'swr/immutable'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'

const useNextClearingPeriod = () => {
  const sdk = useSdk()
  const { currentChainId } = useChain()

  const { data, error } = useSWRImmutable(
    sdk && currentChainId ? ['nextClearingPeriod', currentChainId] : null,
    async () => await sdk!.Locking.getNextClearingPeriodDate()
  )

  return {
    nextClearingPeriod: data || 0,
    error,
    isLoading: !data && !error,
  }
}

export default useNextClearingPeriod
