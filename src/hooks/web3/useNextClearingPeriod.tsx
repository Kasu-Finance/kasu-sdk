import useSWRImmutable from 'swr/immutable'

import useSdk from '@/hooks/context/useSdk'

const useNextClearingPeriod = () => {
  const sdk = useSdk()

  const { data, error } = useSWRImmutable(
    sdk ? ['nextClearingPeriod', sdk] : null,
    async ([_, sdk]) => await sdk.Locking.getNextClearingPeriodDate()
  )

  return {
    nextClearingPeriod: data || 0,
    error,
    isLoading: !data && !error,
  }
}

export default useNextClearingPeriod
