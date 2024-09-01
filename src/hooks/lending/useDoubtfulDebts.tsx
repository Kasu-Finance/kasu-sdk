import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const useDoubtfulDebts = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchDoubtfulDebts = async () => {
    const data = await sdk.DataService.getBadAndDoubtfulDebts()

    if (!data?.length) throw new Error('No data available for doubtful debts')
    const filteredData = data.find((item) => item.poolIdFK === poolId)

    if (!filteredData)
      throw new Error(`No data available for pool ID: ${poolId}`)

    return filteredData
  }

  const { data, error, mutate } = useSWR(
    `getBadAndDoubtfulDebts/${poolId}`,
    fetchDoubtfulDebts,
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    data,
    error,
    isLoading: !data && !error,
    mutate,
  }
}

export default useDoubtfulDebts
