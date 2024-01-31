'use client'

import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useLockPeriods = () => {
  const sdk = useKasuSDK()

  const { data, error } = useSWR('lockPeriods', async () =>
    sdk.Locking.getActiveLockPeriods()
  )

  return {
    lockPeriods: data!, // global fallback provided
    error,
    isLoading: !data && !error,
  }
}

export default useLockPeriods
