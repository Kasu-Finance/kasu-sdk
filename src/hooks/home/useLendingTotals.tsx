import { LendingTotals } from '@solidant/kasu-sdk/src/services/DataService/types'
import useSWRImmutable from 'swr/immutable'

const useLendingTotals = () => {
  const { data, error, mutate } = useSWRImmutable('lendingTotals', async () => {
    const response = await fetch('/api/lendingTotal')

    if (!response.ok) {
      throw new Error('Failed to fetch lending totals')
    }

    const lendingTotals: LendingTotals = await response.json()

    if (!lendingTotals) {
      throw new Error('No lendingTotals data available.')
    }

    return lendingTotals
  })

  return {
    lendingTotals: data,
    error,
    isLoading: !data && !error,
    refresh: mutate,
  }
}

export default useLendingTotals
