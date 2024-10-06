import { useWeb3React } from '@web3-react/core'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { isLocalhost } from '@/utils'

import { HexString } from '@/types/lending'

const usePoolTrancheBalance = (poolId: string, trancheId: HexString) => {
  const sdk = useKasuSDK()
  const { account: userAddress } = useWeb3React()

  const fetchUserTrancheBalance = async () => {
    if (!poolId || !userAddress) {
      isLocalhost() && console.warn('No poolId or userAddress provided')
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

  const { data, error, isLoading, mutate } = useSWR(
    `userTrancheBalance/${trancheId}`,
    fetchUserTrancheBalance
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

export default usePoolTrancheBalance
