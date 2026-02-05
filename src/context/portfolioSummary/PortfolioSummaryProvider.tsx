'use client'

import { KasuSdk } from '@kasufinance/kasu-sdk'
import { SdkConfig } from '@kasufinance/kasu-sdk/src/sdk-config'
import { PoolOverviewDirectus } from '@kasufinance/kasu-sdk/src/services/DataService/directus-types'
import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { useMemo } from 'react'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'

import { useChain } from '@/hooks/context/useChain'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import portfolioSummaryContext from '@/context/portfolioSummary/portfolioSummary.context'

import sdkConfig from '@/config/sdk'
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
  const { currentChainId: chainId, chainConfig } = useChain()

  const { address } = usePrivyAuthenticated()
  const addressLower = address?.toLowerCase()

  const rpcUrl = chainConfig.rpcUrls[0]
  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  const readOnlySdk = useMemo(() => {
    if (!rpcUrl || !unusedPools) return undefined
    const provider = new QueuedJsonRpcProvider(rpcUrl, 5)
    return new KasuSdk(
      new SdkConfig({
        subgraphUrl: chainConfig.subgraphUrl,
        contracts: chainConfig.contracts,
        directusUrl: sdkConfig.directusUrl,
        UNUSED_LENDING_POOL_IDS: unusedPools.length ? unusedPools : [''],
        isLiteDeployment: chainConfig.isLiteDeployment,
        poolMetadataMapping: chainConfig.poolMetadataMapping,
      }),
      provider
    )
  }, [rpcUrl, unusedPools, chainConfig])

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
