import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useChainId } from 'wagmi'

import useSdk from '@/hooks/context/useSdk'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'
import { MANAGED_DATA_CACHE_TTL } from '@/constants/general'

const useLendingPortfolioData = (
  poolOverviews: PoolOverview[],
  currentEpoch: string
) => {
  const sdk = useSdk()

  const chainId = useChainId()

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
    return new ethers.providers.JsonRpcProvider(rpcUrl)
  }, [rpcUrl])

  const { data, error, mutate } = useSWR(
    address && sdk && chainId
      ? [
          'lendingPortfolioData',
          chainId,
          address.toLowerCase(),
          currentEpoch,
          poolOverviewsKey,
        ]
      : null,
    async ([_, __chainId, userAddress]) => {
      if (!sdk) throw new Error('SDK not ready')
      return await sdk.Portfolio.getPortfolioLendingData(
        userAddress,
        poolOverviews,
        currentEpoch,
        provider
      )
    },
    {
      keepPreviousData: true,
      revalidateIfStale: true,
      refreshInterval: MANAGED_DATA_CACHE_TTL,
    }
  )

  return {
    portfolioLendingPools: data,
    error,
    isLoading: !data && !error,
    updateLendingPortfolioData: mutate,
  }
}

export default useLendingPortfolioData
