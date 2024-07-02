import { LendingTotals } from '@solidant/kasu-sdk/src/services/DataService/types'
import useSWRImmutable from 'swr/immutable'

import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useKasuSDK from '@/hooks/useKasuSDK'

const useLendingTotals = () => {
  const sdk = useKasuSDK()

  const { data: poolOverviews } = usePoolOverview()

  const { data, error, mutate } = useSWRImmutable(
    poolOverviews ? ['lendingTotals', poolOverviews] : null,
    async ([_, poolOverviews]) => {
      const lendingTotals: LendingTotals =
        await sdk.DataService.getLendingTotals(poolOverviews)

      if (!lendingTotals) {
        throw new Error('No lendingTotals data available.')
      }

      return lendingTotals
    }
  )

  return {
    lendingTotals: data,
    error,
    isLoading: !data && !error,
    refresh: mutate,
  }
}

export default useLendingTotals
