'use client'

import { Box, CircularProgress, Typography } from '@mui/material'
import { ReactNode } from 'react'

import { useChain } from '@/hooks/context/useChain'
import usePoolsWithDelegate from '@/hooks/lending/usePoolsWithDelegate'

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

  // Fetch pools with delegate data client-side (applies pool mapping for XDC -> Base)
  const { poolsWithDelegate, isLoading } = usePoolsWithDelegate({
    activePools: true,
    oversubscribed: false,
  })

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

  // Handle empty state
  if (!poolsWithDelegate || poolsWithDelegate.length === 0) {
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
          No pools available
        </Typography>
        <Typography variant='baseMd' color='white'>
          No active lending pools found on {chainConfig.name}.
        </Typography>
      </Box>
    )
  }

  return (
    <PoolLayoutWrapper
      pools={poolsWithDelegate}
      currentEpoch={currentEpoch}
      emptyPoolsPlaceholder={emptyPoolsPlaceholder}
    />
  )
}

export default PoolLayoutChainWrapper
