import useSWRImmutable from 'swr/immutable'

import useKasuSDK from '@/hooks/useKasuSDK'

const useNextEpochTime = () => {
  const sdk = useKasuSDK()

  const { data, error } = useSWRImmutable(
    'nextEpochTime',
    async () => await sdk.Locking.getNextEpochDate()
  )

  return {
    nextEpochTime: data || 0,
    error,
    isLoading: !data && !error,
  }
}

export default useNextEpochTime
