import useSWRImmutable from 'swr/immutable'

import useSdk from '@/hooks/context/useSdk'

const usePerformanceFee = () => {
  const sdk = useSdk()

  const { data, error } = useSWRImmutable(
    sdk ? ['performanceFee'] : null,
    async () => await sdk!.DataService.getPerformanceFee()
  )

  return {
    performanceFee: data,
    error,
    isLoading: !data && !error,
  }
}

export default usePerformanceFee
