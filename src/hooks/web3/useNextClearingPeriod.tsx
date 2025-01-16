import useSWRImmutable from 'swr/immutable'

import useKasuSDK from '@/hooks/useKasuSDK'

const useNextClearingPeriod = () => {
  const sdk = useKasuSDK()

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
