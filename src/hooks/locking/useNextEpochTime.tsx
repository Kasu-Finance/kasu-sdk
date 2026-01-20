import useSWR from 'swr'

import useSdk from '@/hooks/context/useSdk'

const useNextEpochTime = () => {
  const sdk = useSdk()

  const { data, isLoading, error } = useSWR(
    sdk ? ['nextEpochTime'] : null,
    async () => await sdk!.Locking.getNextEpochDate()
  )

  return {
    nextEpochTime: data || 0,
    error,
    isLoading,
  }
}

export default useNextEpochTime
