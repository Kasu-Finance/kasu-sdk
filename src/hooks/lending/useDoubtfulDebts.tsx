import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const useDoubtfulDebts = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchDoubtfulDebts = async () => {
    const data = await sdk.DataService.getBadAndDoubtfulDebts([poolId])

    if (!data?.length) {
      throw new Error('No data available for doubtful debts')
    }

    return data
  }

  const { data, error } = useSWR(
    `getBadAndDoubtfulDebts/${poolId}`,
    fetchDoubtfulDebts,
    {
      dedupingInterval: FIVE_MINUTES,
    }
  )

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default useDoubtfulDebts
