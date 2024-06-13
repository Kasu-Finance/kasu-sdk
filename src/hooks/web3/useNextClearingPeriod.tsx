import useSWRImmutable from 'swr/immutable'

import useKasuSDK from '@/hooks/useKasuSDK'

const useNextClearingPeriod = () => {
  const sdk = useKasuSDK()

  const { data, error } = useSWRImmutable(
    'nextClearingPeriod',
    async () => await sdk.Locking.getNextClearingPeriodDate()
  )

  return {
    nextClearingPeriod: data || 0,
    error,
    isLoading: !data && !error,
  }
}

export default useNextClearingPeriod
