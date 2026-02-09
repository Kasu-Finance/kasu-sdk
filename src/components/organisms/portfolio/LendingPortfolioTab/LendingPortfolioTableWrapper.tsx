'use client'

import { PoolOverview, PortfolioLendingPool } from '@kasufinance/kasu-sdk'
import React, { useMemo } from 'react'

import { useChain } from '@/hooks/context/useChain'
import useCurrentEpoch from '@/hooks/lending/useCurrentEpoch'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'
import { useLiteModeSubgraph } from '@/hooks/lite/useLiteModeSubgraph'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'

import LendingPortfolioTable from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTable'
import LendingPortfolioTableSkeleton from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableSkeleton'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

type LendingPortfolioTableWrapperProps = {
  poolOverviews: PoolOverview[]
  currentEpoch: string
}

const LendingPortfolioTableWrapper: React.FC<
  LendingPortfolioTableWrapperProps
> = ({ poolOverviews, currentEpoch }) => {
  const { currentChainId, isLiteDeployment } = useChain()

  // Server-side props are only valid for DEFAULT_CHAIN_ID
  const isOnDefaultChain = currentChainId === DEFAULT_CHAIN_ID

  // Client-side data for non-default chains
  const { poolOverviews: clientPoolOverviews, isLoading: isPoolsLoading } =
    usePoolOverviews()
  const { currentEpoch: clientCurrentEpoch, isLoading: isEpochLoading } =
    useCurrentEpoch()

  // Use subgraph data on Lite deployments (XDC) to avoid excessive RPC calls
  const { liteModeData, isLoading: isSubgraphLoading } = useLiteModeSubgraph({
    enabled: isLiteDeployment,
  })

  // Use server-side data on default chain, client-side on others
  const effectivePools = isOnDefaultChain
    ? poolOverviews
    : (clientPoolOverviews ?? [])
  const effectiveEpoch = isOnDefaultChain
    ? currentEpoch
    : (clientCurrentEpoch ?? currentEpoch)

  // Track if client-side data is still loading (for non-default chains)
  const isClientDataLoading =
    !isOnDefaultChain &&
    (isPoolsLoading || isEpochLoading || !clientPoolOverviews)

  // Only enable SDK portfolio fetch on full deployments (Base)
  // On Lite deployments, use subgraph data instead to avoid 49+ RPC calls
  const { portfolioLendingPools, isLoading: isSdkLoading } =
    useLendingPortfolioData(effectivePools, effectiveEpoch, {
      enabled:
        !isClientDataLoading && effectivePools.length > 0 && !isLiteDeployment,
    })

  // Convert subgraph data to PortfolioLendingPool format for Lite deployments
  // Note: Many fields are set to defaults since subgraph doesn't provide full data
  const subgraphPortfolioPools = useMemo<
    PortfolioLendingPool[] | undefined
  >(() => {
    if (!isLiteDeployment || !liteModeData || !clientPoolOverviews)
      return undefined

    return liteModeData.pools.map((pool) => {
      const poolOverview = clientPoolOverviews.find(
        (p) => p.id.toLowerCase() === pool.poolId.toLowerCase()
      )

      // Calculate pool totals from tranches
      const totalInvestedAmount = pool.tranches
        .reduce((sum, t) => sum + parseFloat(t.balance), 0)
        .toString()
      const totalYieldLifetime = pool.tranches
        .reduce((sum, t) => sum + t.yieldEarned, 0)
        .toString()

      return {
        // From PoolOverview (via poolOverview lookup)
        ...poolOverview,
        // Override with subgraph data
        id: pool.poolId,
        poolName: pool.poolName,
        isActive: !pool.isStopped,
        // Portfolio-specific fields
        totalInvestedAmount,
        totalYieldEarningsLastEpoch: '0', // Not available from subgraph
        totalYieldEarningsLifetime: totalYieldLifetime,
        requestEpochsInAdvance: poolOverview?.requestEpochsInAdvance ?? '0',
        tranches: pool.tranches.map((tranche) => {
          const trancheOverview = poolOverview?.tranches.find(
            (t) => t.id.toLowerCase() === tranche.trancheId.toLowerCase()
          )
          return {
            // From TrancheData (via trancheOverview lookup)
            ...trancheOverview,
            // Override with subgraph data
            id: tranche.trancheId,
            name: tranche.trancheName,
            // Portfolio tranche fields
            investedAmount: tranche.balance,
            yieldEarnings: {
              lastEpoch: '0', // Not available from subgraph
              lifetime: tranche.yieldEarned.toString(),
            },
            depositDetails: [],
            fixedLoans: [], // No FTD on lite deployments
          }
        }),
      } as PortfolioLendingPool
    })
  }, [isLiteDeployment, liteModeData, clientPoolOverviews])

  // Use subgraph data on Lite deployments, SDK data on full deployments
  const effectivePortfolioPools = isLiteDeployment
    ? subgraphPortfolioPools
    : portfolioLendingPools

  const isLoading = isLiteDeployment
    ? isSubgraphLoading || isClientDataLoading
    : isClientDataLoading || isSdkLoading

  if (isLoading || !effectivePortfolioPools) {
    return <LendingPortfolioTableSkeleton />
  }

  return (
    <LendingPortfolioTable
      currentEpoch={effectiveEpoch}
      portfolioPools={effectivePortfolioPools}
    />
  )
}

export default LendingPortfolioTableWrapper
