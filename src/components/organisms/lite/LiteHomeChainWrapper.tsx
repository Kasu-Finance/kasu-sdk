'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Box, CircularProgress, Typography } from '@mui/material'
import { ReactNode } from 'react'

import { useChain } from '@/hooks/context/useChain'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'

import LiteHome from '@/components/organisms/lite/LiteHome'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteHomeChainWrapperProps = {
  /** Server-rendered pools (always from DEFAULT_CHAIN) */
  serverPools: PoolOverviewWithDelegate[]
  /** Server-rendered portfolio pools */
  serverPortfolioPools?: PoolOverview[]
  /** Current epoch from server */
  currentEpoch: string
  /** Loading fallback content */
  loadingFallback?: ReactNode
}

/**
 * Wrapper for LiteHome that handles chain-specific pool fetching.
 *
 * On DEFAULT_CHAIN (Base): Uses server-rendered pools for fast initial paint.
 * On other chains (XDC): Fetches pools client-side from the correct subgraph.
 *
 * This ensures users see the correct pools for their selected chain.
 */
const LiteHomeChainWrapper: React.FC<LiteHomeChainWrapperProps> = ({
  serverPools,
  serverPortfolioPools,
  currentEpoch,
  loadingFallback,
}) => {
  const { currentChainId, chainConfig } = useChain()
  const isDefaultChain = currentChainId === DEFAULT_CHAIN_ID

  // Fetch pools client-side for non-default chains
  const { poolOverviews, isLoading, error } = usePoolOverviews()

  // On default chain, use server-rendered data
  if (isDefaultChain) {
    return (
      <LiteHome
        pools={serverPools}
        portfolioPools={serverPortfolioPools}
        currentEpoch={currentEpoch}
      />
    )
  }

  // On other chains, show loading while fetching
  if (isLoading) {
    return (
      loadingFallback ?? (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight={400}
          gap={2}
        >
          <CircularProgress color='primary' />
          <Typography variant='baseMd' color='white'>
            Loading {chainConfig.name} pools...
          </Typography>
        </Box>
      )
    )
  }

  // Handle error state
  if (error || !poolOverviews) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight={400}
        textAlign='center'
        px={3}
      >
        <Typography variant='h4' color='gold.dark' mb={2}>
          Unable to load pools
        </Typography>
        <Typography variant='baseMd' color='white'>
          Could not fetch lending pools for {chainConfig.name}.
          <br />
          Please try again or switch to Base.
        </Typography>
      </Box>
    )
  }

  // Filter to only active, non-oversubscribed pools (same as server logic)
  const activePools = poolOverviews.filter(
    (pool) => pool.isActive && !pool.isOversubscribed
  )

  // Transform to PoolOverviewWithDelegate (delegate data not critical for lite mode display)
  // The delegate info is only used in full mode, not in lite mode UI
  const poolsWithDelegate: PoolOverviewWithDelegate[] = activePools.map(
    (pool) => ({
      ...pool,
      delegate: {
        id: pool.id,
        delegateLendingHistory: 0,
        assetClasses: pool.assetClass,
        otherKASUPools: [
          {
            id: pool.id,
            name: pool.poolName,
            isActive: pool.isActive,
            isOversubscribed: pool.isOversubscribed,
          },
        ],
        totalLoanFundsOriginated: parseFloat(pool.loanFundsOriginated) || 0,
        totalLoansOriginated: parseInt(pool.activeLoans) || 0,
        loansUnderManagement: parseFloat(pool.loansUnderManagement) || 0,
        historicLossRate: 0,
      },
    })
  )

  return (
    <LiteHome
      pools={poolsWithDelegate}
      portfolioPools={poolOverviews}
      currentEpoch={currentEpoch}
    />
  )
}

export default LiteHomeChainWrapper
