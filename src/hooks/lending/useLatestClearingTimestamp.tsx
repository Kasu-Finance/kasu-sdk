import { gql, GraphQLClient } from 'graphql-request'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import sdkConfig from '@/config/sdk'

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

const graphClient = new GraphQLClient(sdkConfig.subgraphUrl)

const useLatestClearingTimestamp = (poolIds?: string[]) => {
  const chainId = useChainId()

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
    normalizedPoolIds.length && chainId
      ? ['latestClearingTimestamp', chainId, normalizedPoolIds.join(',')]
      : null,
    async () => {
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
