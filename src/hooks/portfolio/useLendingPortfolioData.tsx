import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { useMemo } from 'react'
import useSWR from 'swr'

import { useChain } from '@/hooks/context/useChain'
import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'
import QueuedJsonRpcProvider from '@/utils/rpc/QueuedJsonRpcProvider'

type UseLendingPortfolioDataOptions = {
  /**
   * Whether to enable the hook. Set to false to prevent fetching.
   * Useful when server-side props don't match current chain.
   */
  enabled?: boolean
}

const useLendingPortfolioData = (
  poolOverviews: PoolOverview[],
  currentEpoch: string,
  options?: UseLendingPortfolioDataOptions
) => {
  const enabled = options?.enabled ?? true
  const sdk = useSdk()

  const { currentChainId: chainId } = useChain()

  const { address } = usePrivyAuthenticated()

  const poolOverviewsKey = useMemo(() => {
    return poolOverviews
      .map(
        (pool) =>
          `${pool.id.toLowerCase()}:${pool.tranches
            .map((tranche) => tranche.id.toLowerCase())
            .sort()
            .join(',')}`
      )
      .sort()
      .join('|')
  }, [poolOverviews])

  const rpcUrl = RPC_URLS[chainId as SupportedChainIds]?.[0]
  const provider = useMemo(() => {
    if (!rpcUrl) return undefined
    return new QueuedJsonRpcProvider(rpcUrl, 5)
  }, [rpcUrl])

  type PortfolioDataWithChain = {
    pools: PortfolioLendingPool[]
    _chainId: number
  }

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled && address && sdk && chainId
      ? [
          'lendingPortfolioData',
          chainId,
          address.toLowerCase(),
          currentEpoch,
          poolOverviewsKey,
        ]
      : null,
    async ([_, fetchChainId, userAddress]): Promise<PortfolioDataWithChain> => {
      if (!sdk) throw new Error('SDK not ready')
      const pools = await sdk.Portfolio.getPortfolioLendingData(
        userAddress,
        poolOverviews,
        currentEpoch,
        provider
      )
      // Include chainId in data to verify it matches current chain
      return { pools, _chainId: fetchChainId }
    },
    {
      keepPreviousData: true,
      revalidateIfStale: true,
    }
  )

  // Only return data if it's for the current chain (prevents stale data from old chain)
  const validData = data && data._chainId === chainId ? data.pools : undefined

  // Loading if SWR is loading or we have stale data from wrong chain
  const isLoadingState = Boolean(
    isLoading || (data && data._chainId !== chainId)
  )

  return {
    portfolioLendingPools: validData,
    error,
    isLoading: isLoadingState,
    isValidating,
    updateLendingPortfolioData: mutate,
  }
}

export default useLendingPortfolioData
