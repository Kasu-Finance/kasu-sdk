'use client'

import { Box, CircularProgress, Typography } from '@mui/material'
import { ReactNode } from 'react'

import { useChain } from '@/hooks/context/useChain'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'

import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolLayoutChainWrapperProps = {
  /** Server-rendered pools (always from DEFAULT_CHAIN) */
  serverPools: PoolOverviewWithDelegate[]
  /** Current epoch from server */
  currentEpoch: string
  /** Placeholder to show when no pools */
  emptyPoolsPlaceholder: ReactNode
}

/**
 * Wrapper for PoolLayoutWrapper that handles chain-specific pool fetching.
 *
 * On DEFAULT_CHAIN (Base): Uses server-rendered pools for fast initial paint.
 * On other chains (XDC): Fetches pools client-side from the correct subgraph.
 */
const PoolLayoutChainWrapper: React.FC<PoolLayoutChainWrapperProps> = ({
  serverPools,
  currentEpoch,
  emptyPoolsPlaceholder,
}) => {
  const { currentChainId, chainConfig } = useChain()
  const isDefaultChain = currentChainId === DEFAULT_CHAIN_ID

  // Fetch pools client-side for non-default chains
  const { poolOverviews, isLoading, error } = usePoolOverviews()

  // On default chain, use server-rendered data
  if (isDefaultChain) {
    return (
      <PoolLayoutWrapper
        pools={serverPools}
        currentEpoch={currentEpoch}
        emptyPoolsPlaceholder={emptyPoolsPlaceholder}
      />
    )
  }

  // On other chains, show loading while fetching
  if (isLoading) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight={300}
        gap={2}
      >
        <CircularProgress color='primary' />
        <Typography variant='baseMd' color='white'>
          Loading {chainConfig.name} pools...
        </Typography>
      </Box>
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
        minHeight={300}
        textAlign='center'
        px={3}
      >
        <Typography variant='h4' color='gold.dark' mb={2}>
          Unable to load pools
        </Typography>
        <Typography variant='baseMd' color='white'>
          Could not fetch lending pools for {chainConfig.name}.
        </Typography>
      </Box>
    )
  }

  // Filter to only active, non-oversubscribed pools
  const activePools = poolOverviews.filter(
    (pool) => pool.isActive && !pool.isOversubscribed
  )

  // Transform to PoolOverviewWithDelegate
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
    <PoolLayoutWrapper
      pools={poolsWithDelegate}
      currentEpoch={currentEpoch}
      emptyPoolsPlaceholder={emptyPoolsPlaceholder}
    />
  )
}

export default PoolLayoutChainWrapper
