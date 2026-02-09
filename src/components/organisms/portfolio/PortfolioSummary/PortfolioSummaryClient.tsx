'use client'

import { PoolOverview, PortfolioLendingPool } from '@kasufinance/kasu-sdk'
import { Grid2 } from '@mui/material'
import React, { useMemo } from 'react'

import { useChain } from '@/hooks/context/useChain'
import useCurrentEpoch from '@/hooks/lending/useCurrentEpoch'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'
import { useLiteModeSubgraph } from '@/hooks/lite/useLiteModeSubgraph'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'

import InfoColumn from '@/components/atoms/InfoColumn'
import WaveBox from '@/components/atoms/WaveBox'
import LifetimeFeesEarned from '@/components/organisms/portfolio/PortfolioSummary/LifetimeFeesEarned'
import LifetimeInterestEarnings from '@/components/organisms/portfolio/PortfolioSummary/LifetimeInterestEarnings'
import LifetimeKsuBonusRewards from '@/components/organisms/portfolio/PortfolioSummary/LifetimeKsuBonusRewards'
import TotalKsuLocked from '@/components/organisms/portfolio/PortfolioSummary/TotalKsuLocked'
import TotalLendingBalance from '@/components/organisms/portfolio/PortfolioSummary/TotalLendingBalance'
import WeightedAverageApy from '@/components/organisms/portfolio/PortfolioSummary/WeightedAverageApy'

import PortfolioSummaryProvider from '@/context/portfolioSummary/PortfolioSummaryProvider'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

type PortfolioSummaryClientProps = {
  currentEpoch: string
  poolOverviews: PoolOverview[]
  titleMap: {
    totalKsuLocked: string
    totalKsuLockedTooltip: string
    totalLendingBalance: string
    totalLendingBalanceTooltip: string
    weightedAverageApy: string
    weightedAverageApyTooltip: string
    lifetimeInterestEarnings: string
    lifetimeInterestEarningsTooltip: string
    lifetimeKsuBonusRewards: string
    lifetimeKsuBonusRewardsTooltip: string
    lifetimeFeesEarned: string
    lifetimeFeesEarnedTooltip: string
  }
}

const PortfolioSummaryClient: React.FC<PortfolioSummaryClientProps> = ({
  currentEpoch,
  poolOverviews,
  titleMap,
}) => {
  const { isLiteDeployment, currentChainId } = useChain()

  // Server-side props are only valid for DEFAULT_CHAIN_ID
  const isOnDefaultChain = currentChainId === DEFAULT_CHAIN_ID

  // Client-side data for non-default chains
  const { poolOverviews: clientPoolOverviews, isLoading: isPoolsLoading } =
    usePoolOverviews()
  const { currentEpoch: clientCurrentEpoch, isLoading: isEpochLoading } =
    useCurrentEpoch()

  // Use subgraph data on Lite deployments to avoid excessive RPC calls
  const { liteModeData } = useLiteModeSubgraph({
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
  const { portfolioLendingPools: sdkPortfolioPools } = useLendingPortfolioData(
    effectivePools,
    effectiveEpoch,
    {
      enabled:
        !isClientDataLoading && effectivePools.length > 0 && !isLiteDeployment,
    }
  )

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
  const portfolioLendingPools = isLiteDeployment
    ? subgraphPortfolioPools
    : sdkPortfolioPools

  // On lite deployments (XDC), show 4 items in 2x2 grid (size=6)
  // On full deployments (Base), show 6 items in 2x3 grid (size=4)
  const gridSize = isLiteDeployment ? 6 : 4

  return (
    <PortfolioSummaryProvider
      currentEpoch={effectiveEpoch}
      poolOverviews={effectivePools}
      portfolioLendingPools={portfolioLendingPools}
    >
      <Grid2 container spacing={4} mb={5}>
        {/* KSU Locked - only on full deployments */}
        {!isLiteDeployment && (
          <Grid2 size={gridSize}>
            <WaveBox borderRadius={2} py={4} px={2} height={116}>
              <InfoColumn
                title={titleMap.totalKsuLocked}
                toolTipInfo={titleMap.totalKsuLockedTooltip}
                metric={<TotalKsuLocked />}
              />
            </WaveBox>
          </Grid2>
        )}
        <Grid2 size={gridSize}>
          <WaveBox borderRadius={2} py={4} px={2} height={116}>
            <InfoColumn
              title={titleMap.totalLendingBalance}
              toolTipInfo={titleMap.totalLendingBalanceTooltip}
              metric={<TotalLendingBalance />}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={gridSize}>
          <WaveBox borderRadius={2} py={4} px={2} height={116}>
            <InfoColumn
              title={titleMap.weightedAverageApy}
              toolTipInfo={titleMap.weightedAverageApyTooltip}
              metric={<WeightedAverageApy />}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={gridSize}>
          <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
            <InfoColumn
              title={titleMap.lifetimeInterestEarnings}
              toolTipInfo={titleMap.lifetimeInterestEarningsTooltip}
              metric={<LifetimeInterestEarnings />}
            />
          </WaveBox>
        </Grid2>
        {/* KSU Bonus Rewards - only on full deployments */}
        {!isLiteDeployment && (
          <Grid2 size={gridSize}>
            <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
              <InfoColumn
                title={titleMap.lifetimeKsuBonusRewards}
                toolTipInfo={titleMap.lifetimeKsuBonusRewardsTooltip}
                metric={<LifetimeKsuBonusRewards />}
              />
            </WaveBox>
          </Grid2>
        )}
        <Grid2 size={gridSize}>
          <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
            <InfoColumn
              title={titleMap.lifetimeFeesEarned}
              toolTipInfo={titleMap.lifetimeFeesEarnedTooltip}
              metric={<LifetimeFeesEarned />}
            />
          </WaveBox>
        </Grid2>
      </Grid2>
    </PortfolioSummaryProvider>
  )
}

export default PortfolioSummaryClient
