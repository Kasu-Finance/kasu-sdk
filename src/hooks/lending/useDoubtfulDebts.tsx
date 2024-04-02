import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const useDoubtfulDebts = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchDoubtfulDebts = async () => {
    const data = await sdk.DataService.getBadAndDoubtfulDebts()

    if (!data?.length) {
      throw new Error('No data available for doubtful debts')
    }

    return data
  }

  const { data, error, mutate } = useSWR(
    `getBadAndDoubtfulDebts/${poolId}`,
    fetchDoubtfulDebts,
    {
      dedupingInterval: FIVE_MINUTES,
    }
  )

  let customError = error
  let filteredData = data
    ? data.filter((item) => item.poolIdFK === poolId)
    : null

  filteredData = filteredData === undefined ? null : filteredData

  if (data && !filteredData) {
    customError = new Error(`No data available for pool ID: ${poolId}`)
    console.error(`No data available for pool ID: ${poolId}`)
  }

  return {
    data: filteredData,
    error: customError,
    isLoading: !filteredData && !customError,
    mutate,
  }
}

export default useDoubtfulDebts
