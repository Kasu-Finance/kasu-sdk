import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { HexString } from '@/types/lending'

const usePoolTrancheBalance = (poolId: string, trancheId: HexString) => {
  const sdk = useKasuSDK()
  const { account: userAddress } = useWeb3React()

  const fetchUserTrancheBalance = async () => {
    if (!poolId || !userAddress) {
      console.error('No poolId or userAddress provided')
      return null
    }

    const data = await sdk.UserLending.getUserTrancheBalance(
      userAddress,
      trancheId
    )

    if (!data) {
      throw new Error('No user balance found for this tranche')
    }

    return data
  }

  const { data, error, mutate } = useSWR(
    `userTrancheBalance/${trancheId}`,
    fetchUserTrancheBalance
  )

  return {
    data,
    error,
    isLoading: !data && !error,
    mutate,
  }
}

export default usePoolTrancheBalance
