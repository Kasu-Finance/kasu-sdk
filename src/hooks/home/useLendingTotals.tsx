import { LendingTotals } from '@solidant/kasu-sdk/src/services/DataService/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useLendingTotals = () => {
  const sdk = useKasuSDK()

  const fetchLendingTotals = async () => {
    const lendingTotals: LendingTotals =
      await sdk.DataService.getLendingTotals()

    if (!lendingTotals) {
      throw new Error('No lendingTotals data available.')
    }

    return lendingTotals
  }

  const { data, error, mutate } = useSWR('lendingTotals', fetchLendingTotals)

  return {
    lendingTotals: data,
    error,
    isLoading: !data && !error,
    refresh: mutate,
  }
}

export default useLendingTotals
