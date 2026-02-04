'use client'

import { KasuSdk } from '@kasufinance/kasu-sdk'
import { PoolOverviewDirectus } from '@kasufinance/kasu-sdk/src/services/DataService/directus-types'
import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { useMemo } from 'react'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { useChainId } from 'wagmi'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import portfolioSummaryContext from '@/context/portfolioSummary/portfolioSummary.context'

import sdkConfig from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'
import { FIVE_MINUTES } from '@/constants/general'
import QueuedJsonRpcProvider from '@/utils/rpc/QueuedJsonRpcProvider'

type PortfolioSummaryProviderProps = {
  children: React.ReactNode
  currentEpoch: string
  poolOverviews: PoolOverview[]
  portfolioLendingPools?: PortfolioLendingPool[]
}

const unusedPoolsFetcher = async () => {
  const res = await fetch(
    `${sdkConfig.directusUrl}items/PoolOverview?filter[enabled][_neq]=true`
  )

  if (!res.ok) {
    throw new Error(
      `Failed to fetch unused pools data: ${res.status} ${res.statusText}`
    )
  }

  const unusedPools: { data: PoolOverviewDirectus[] } = await res.json()
  const filteredPools = unusedPools.data.map((pool) => pool.id)

  return filteredPools
}

const PortfolioSummaryProvider: React.FC<PortfolioSummaryProviderProps> = ({
  children,
  currentEpoch,
  poolOverviews,
  portfolioLendingPools,
}) => {
  const chainId = useChainId()

  const { address } = usePrivyAuthenticated()
  const addressLower = address?.toLowerCase()

  const rpcUrl = RPC_URLS[chainId as SupportedChainIds]?.[0]
  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  const readOnlySdk = useMemo(() => {
    if (!rpcUrl || !unusedPools) return undefined
    const provider = new QueuedJsonRpcProvider(rpcUrl, 5)
    return new KasuSdk(
      {
        ...sdkConfig,
        UNUSED_LENDING_POOL_IDS: unusedPools.length ? unusedPools : [''],
      },
      provider
    )
  }, [rpcUrl, unusedPools])

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

  const shouldEnable = Boolean(addressLower && chainId && readOnlySdk)
  const canFetch = shouldEnable && Boolean(portfolioLendingPools)

  const key = canFetch
    ? ([
        'portfolioSummary',
        chainId,
        addressLower!,
        currentEpoch,
        poolOverviewsKey,
      ] as const)
    : null

  const {
    data: portfolioSummary,
    error,
    isLoading: swrIsLoading,
    mutate,
  } = useSWR(
    key,
    async ([_, __chainId, userAddress, epoch]) => {
      if (!readOnlySdk) throw new Error('SDK not ready')
      if (!portfolioLendingPools) {
        throw new Error('Portfolio lending pools not ready')
      }
      return await readOnlySdk.Portfolio.getPortfolioSummary(
        userAddress,
        portfolioLendingPools,
        epoch
      )
    },
    {
      dedupingInterval: FIVE_MINUTES,
      keepPreviousData: true,
      revalidateIfStale: false,
    }
  )

  const isLoading = shouldEnable && !portfolioLendingPools ? true : swrIsLoading

  return (
    <portfolioSummaryContext.Provider
      value={{
        portfolioSummary,
        isLoading,
        error,
        updatePortfolioSummary: mutate,
      }}
    >
      {children}
    </portfolioSummaryContext.Provider>
  )
}

export default PortfolioSummaryProvider
