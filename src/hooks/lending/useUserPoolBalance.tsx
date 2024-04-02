import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useUserPoolBalance = (poolId: string, userAddress: string) => {
  const sdk = useKasuSDK()

  const fetchUserBalance = async () => {
    if (!poolId || !userAddress) {
      console.error('No poolId or userAddress provided')
      return null
    }

    const data = await sdk.UserLending.getUserPoolBalance(poolId, userAddress)
    console.warn('fetchUserBalance', data)

    if (!data) {
      throw new Error('No user balance found for this pool')
    }

    return data
  }

  const { data, error, mutate } = useSWR(
    `userPoolBalance/${poolId}`,
    fetchUserBalance
  )

  return {
    data,
    error,
    isLoading: !data && !error,
    mutate,
  }
}

export default useUserPoolBalance
