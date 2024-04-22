import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const usePoolRepayments = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchPoolRepayments = async () => {
    const allRepayments = await sdk.DataService.getRepayments()

    if (!allRepayments?.length) {
      throw new Error('No pool repayments data found')
    }

    return allRepayments
  }

  const { data, error, mutate } = useSWR(
    `getRepayments/${poolId}`,
    fetchPoolRepayments
  )

  let customError = error
  let filteredRepayments = data
    ? data.find((repayment) => repayment.poolIdFK === poolId)
    : null

  filteredRepayments =
    filteredRepayments === undefined ? null : filteredRepayments

  if (data && !filteredRepayments) {
    customError = new Error(`No data available for pool ID: ${poolId}`)
    console.error(`No data available for pool ID: ${poolId}`)
  }

  return {
    data: filteredRepayments,
    error: customError,
    isLoading: !filteredRepayments && !customError,
    mutate,
  }
}

export default usePoolRepayments
