import { gql, GraphQLClient } from 'graphql-request'
import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'

type LendingPoolClearing = {
  startTimestamp: string
}

type LatestClearingQueryResult = {
  lendingPoolClearings: LendingPoolClearing[]
}

const latestClearingQuery = gql`
  query LatestClearingQuery($poolIds: [String!], $first: Int!) {
    lendingPoolClearings(
      first: $first
      orderBy: startTimestamp
      orderDirection: desc
      where: { lendingPool_in: $poolIds }
    ) {
      startTimestamp
    }
  }
`

const useLatestClearingTimestamp = (poolIds?: string[]) => {
  const { currentChainId, chainConfig } = useChain()

  // Create GraphQL client with chain-specific subgraph URL
  // Guard against empty URL during SSR/prerendering
  const graphClient = useMemo(() => {
    if (!chainConfig.subgraphUrl) return null
    return new GraphQLClient(chainConfig.subgraphUrl)
  }, [chainConfig.subgraphUrl])

  const normalizedPoolIds = useMemo(() => {
    if (!poolIds?.length) return []

    return Array.from(
      new Set(
        poolIds
          .map((poolId) => poolId.toLowerCase())
          .filter((poolId) => poolId.length > 0)
      )
    )
  }, [poolIds])

  const { data, error, isLoading } = useSWR(
    normalizedPoolIds.length && currentChainId && graphClient
      ? ['latestClearingTimestamp', currentChainId, normalizedPoolIds.join(',')]
      : null,
    async () => {
      if (!graphClient) throw new Error('GraphQL client not ready')
      const result = await graphClient.request<LatestClearingQueryResult>(
        latestClearingQuery,
        {
          poolIds: normalizedPoolIds,
          first: 1,
        }
      )

      const timestamp = result.lendingPoolClearings[0]?.startTimestamp

      return timestamp ? parseInt(timestamp, 10) : 0
    },
    {
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  return {
    latestClearingTimestamp: data ?? 0,
    error,
    isLoading,
  }
}

export default useLatestClearingTimestamp
