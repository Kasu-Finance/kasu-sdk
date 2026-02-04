import { gql, GraphQLClient } from 'graphql-request'
import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

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

type UseUserLockDepositsInfoOptions = {
  enabled?: boolean
}

const useUserLockDepositsInfo = (options?: UseUserLockDepositsInfoOptions) => {
  const { currentChainId, chainConfig } = useChain()
  const { address } = usePrivyAuthenticated()
  const enabled = options?.enabled ?? true

  // Create GraphQL client with chain-specific subgraph URL
  const graphClient = useMemo(() => {
    if (!chainConfig.subgraphUrl) return null
    return new GraphQLClient(chainConfig.subgraphUrl)
  }, [chainConfig.subgraphUrl])

  const { data, error, isLoading, mutate } = useSWR(
    enabled && address && currentChainId && graphClient
      ? ['userLockDepositsInfo', currentChainId, address.toLowerCase()]
      : null,
    async ([
      _,
      __chainId,
      userAddress,
    ]): Promise<UserLockDepositsInfo | null> => {
      if (!graphClient) throw new Error('GraphQL client not ready')
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
