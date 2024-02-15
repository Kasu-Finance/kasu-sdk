import useSWRImmutable from 'swr/immutable'

import useKasuSDK from '@/hooks/useKasuSDK'

const useNextEpochTime = () => {
  const sdk = useKasuSDK()

  const { data, error } = useSWRImmutable('nextEpochTime', () =>
    sdk.Locking.getNextEpochDate()
  )

  return {
    nextEpochTime: data,
    error,
    isLoading: !data && !error,
  }
}

export default useNextEpochTime
