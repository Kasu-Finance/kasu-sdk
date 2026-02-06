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
import { useLiteModeSubgraph } from '@/hooks/lite/useLiteModeSubgraph'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import portfolioSummaryContext from '@/context/portfolioSummary/portfolioSummary.context'

import { DEFAULT_CHAIN_ID } from '@/config/chains'
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

  // On non-default chains, use subgraph data instead of SDK
  const isOnDefaultChain = chainId === DEFAULT_CHAIN_ID
  const {
    liteModeData,
    isLoading: subgraphLoading,
    error: subgraphError,
    updateLiteModeData,
  } = useLiteModeSubgraph({ enabled: !isOnDefaultChain })

  const rpcUrl = chainConfig.rpcUrls[0]
  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  const readOnlySdk = useMemo(() => {
    // Only create SDK for default chain
    if (!isOnDefaultChain) return undefined
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
  }, [rpcUrl, unusedPools, chainConfig, isOnDefaultChain])

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
    data: sdkPortfolioSummary,
    error: sdkError,
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

  // Build portfolio summary from subgraph data for non-default chains
  const subgraphPortfolioSummary = useMemo(() => {
    if (isOnDefaultChain || !liteModeData) return undefined

    // Convert subgraph data to portfolio summary format
    // Values are in wei (6 decimals for USDC), convert to human-readable
    const totalBalance = (liteModeData.totalBalance / 1e6).toString()
    const totalYield = (liteModeData.totalYieldEarned / 1e6).toString()

    return {
      current: {
        totalKsuLocked: '0', // No KSU on Lite deployments
        totalLendingPoolInvestments: totalBalance,
        weightedAverageApy: '0', // Would need pool APY data
      },
      daily: {
        yieldEarnings: '0', // Would need APY calculation
      },
      weekly: {
        yieldEarnings: '0', // Would need APY calculation
        protocolFeesEarned: '0',
        ksuBonusRewards: '0',
      },
      lifetime: {
        yieldEarnings: totalYield,
        ksuBonusRewards: '0',
        protocolFeesEarned: '0',
      },
    }
  }, [isOnDefaultChain, liteModeData])

  // Use SDK data on default chain, subgraph data on other chains
  const portfolioSummary = isOnDefaultChain
    ? sdkPortfolioSummary
    : subgraphPortfolioSummary
  const error = isOnDefaultChain ? sdkError : subgraphError

  // Loading state depends on which data source we're using
  const isLoading = isOnDefaultChain
    ? shouldEnable && !portfolioLendingPools
      ? true
      : swrIsLoading
    : subgraphLoading

  // Mutate function depends on data source
  const updatePortfolioSummary = async () => {
    if (isOnDefaultChain) {
      return await mutate()
    } else {
      await updateLiteModeData()
      return subgraphPortfolioSummary
    }
  }

  return (
    <portfolioSummaryContext.Provider
      value={{
        portfolioSummary,
        isLoading,
        error,
        updatePortfolioSummary,
      }}
    >
      {children}
    </portfolioSummaryContext.Provider>
  )
}

export default PortfolioSummaryProvider
