import { gql, GraphQLClient } from 'graphql-request'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import sdkConfig from '@/config/sdk'

export type UserLockDepositsInfo = {
  id: string
  feesClaimed: string
  rKSUAmount: string
  totalKsuBonusAmount: string
  ksuLockedAmount: string
}

type UserLockDepositsInfoQueryResult = {
  userLockDepositsInfo: UserLockDepositsInfo | null
}

const userLockDepositsInfoQuery = gql`
  query UserLockDepositsInfoQuery($userAddress: String!) {
    userLockDepositsInfo(id: $userAddress) {
      id
      feesClaimed
      rKSUAmount
      totalKsuBonusAmount
      ksuLockedAmount
    }
  }
`

const graphClient = new GraphQLClient(sdkConfig.subgraphUrl)

type UseUserLockDepositsInfoOptions = {
  enabled?: boolean
}

const useUserLockDepositsInfo = (options?: UseUserLockDepositsInfoOptions) => {
  const chainId = useChainId()
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  const { data, error, isLoading, mutate } = useSWR(
    enabled && address && chainId
      ? ['userLockDepositsInfo', chainId, address.toLowerCase()]
      : null,
    async ([
      _,
      __chainId,
      userAddress,
    ]): Promise<UserLockDepositsInfo | null> => {
      const result = await graphClient.request<UserLockDepositsInfoQueryResult>(
        userLockDepositsInfoQuery,
        { userAddress }
      )

      return result.userLockDepositsInfo
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    userLockDepositsInfo: data,
    error,
    isLoading: enabled && isLoading,
    updateUserLockDepositsInfo: mutate,
  }
}

export default useUserLockDepositsInfo
