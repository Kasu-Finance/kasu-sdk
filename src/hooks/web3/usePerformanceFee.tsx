import useSWRImmutable from 'swr/immutable'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePerformanceFee = () => {
  const sdk = useKasuSDK()

  const { data, error } = useSWRImmutable(
    'performanceFee',
    async () => await sdk.DataService.getPerformanceFee()
  )

  return {
    performanceFee: data,
    error,
    isLoading: !data && !error,
  }
}

export default usePerformanceFee
