'use client'

import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { useChain } from '@/hooks/context/useChain'
import usePoolDelegate, {
  createFallbackDelegate,
} from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import LendingRequestionTransactions from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions'
import PoolOverviewComponent from '@/components/organisms/lending/OverviewTab/PoolOverview'
import UserLending from '@/components/organisms/lending/OverviewTab/UserLending'
import UserLoyalty from '@/components/organisms/lending/OverviewTab/UserLoyalty'
import WithdrawalRequestTransactions from '@/components/organisms/lending/OverviewTab/WithdrawalRequestTransactions'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

import { PoolOverviewWithDelegate } from '@/types/page'

type PoolOverviewTabChainWrapperProps = {
  /** Server-rendered pool data (always from DEFAULT_CHAIN, null if pool not on Base) */
  serverPool: PoolOverviewWithDelegate | null
  /** All server pools for loyalty component */
  serverPools: PoolOverviewWithDelegate[]
  /** Pool ID */
  poolId: string
  /** Lock periods from server */
  lockPeriods: LockPeriod[]
  /** Current epoch from server */
  currentEpoch: string
}

/**
 * Chain-aware wrapper for PoolOverviewTab content.
 *
 * On DEFAULT_CHAIN (Base): Uses server-rendered pool data for fast initial paint.
 * On other chains (XDC): Fetches pool data client-side from the correct subgraph.
 *
 * Uses a mounted state to prevent hydration mismatch - server always renders
 * as if on DEFAULT_CHAIN, then client updates to actual chain.
 */
const PoolOverviewTabChainWrapper: React.FC<
  PoolOverviewTabChainWrapperProps
> = ({ serverPool, serverPools, poolId, lockPeriods, currentEpoch }) => {
  const { currentChainId, chainConfig } = useChain()
  const isDefaultChain = currentChainId === DEFAULT_CHAIN_ID
  const [hasMounted, setHasMounted] = useState(false)

  // Track client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Fetch pool client-side for non-default chains
  const { data: clientPools, isLoading, error } = usePoolOverview(poolId)

  // Fetch delegate data with proper pool mapping (XDC -> Base)
  const { delegate, isLoading: isDelegateLoading } = usePoolDelegate(poolId)

  // Before mount, show loading to match server (which has no chain context)
  // This prevents hydration mismatch when client has XDC selected
  if (!hasMounted) {
    // If server has pool data, render it (for Base pools)
    if (serverPool) {
      return (
        <Stack spacing={3} mt={3}>
          <PoolOverviewComponent
            pool={serverPool}
            currentEpoch={currentEpoch}
          />
          <UserLending pool={serverPool} />
          <UserLoyalty
            pools={serverPools}
            poolId={poolId}
            currentEpoch={currentEpoch}
            lockPeriods={lockPeriods}
          />
          <LendingRequestionTransactions
            poolId={poolId}
            currentEpoch={currentEpoch}
          />
          <WithdrawalRequestTransactions
            poolId={poolId}
            currentEpoch={currentEpoch}
          />
        </Stack>
      )
    }
    // For XDC pools, server has no data - show loading
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight={300}
        gap={2}
        mt={3}
      >
        <CircularProgress color='primary' />
        <Typography variant='baseMd' color='white'>
          Loading pool details...
        </Typography>
      </Box>
    )
  }

  // On default chain with server data, use it directly
  if (isDefaultChain && serverPool) {
    return (
      <Stack spacing={3} mt={3}>
        <PoolOverviewComponent pool={serverPool} currentEpoch={currentEpoch} />
        <UserLending pool={serverPool} />
        <UserLoyalty
          pools={serverPools}
          poolId={poolId}
          currentEpoch={currentEpoch}
          lockPeriods={lockPeriods}
        />
        <LendingRequestionTransactions
          poolId={poolId}
          currentEpoch={currentEpoch}
        />
        <WithdrawalRequestTransactions
          poolId={poolId}
          currentEpoch={currentEpoch}
        />
      </Stack>
    )
  }

  // On default chain but no server data (XDC pool address on Base) - show error
  if (isDefaultChain && !serverPool) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight={300}
        textAlign='center'
        px={3}
        mt={3}
      >
        <Typography variant='h4' color='gold.dark' mb={2}>
          Pool not found
        </Typography>
        <Typography variant='baseMd' color='white'>
          This pool address does not exist on Base.
          <br />
          Switch to XDC to view this pool.
        </Typography>
      </Box>
    )
  }

  // On other chains, show loading while fetching
  if (isLoading || isDelegateLoading) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight={300}
        gap={2}
        mt={3}
      >
        <CircularProgress color='primary' />
        <Typography variant='baseMd' color='white'>
          Loading pool details...
        </Typography>
      </Box>
    )
  }

  // Handle error state or no pool found
  if (error || !clientPools || clientPools.length === 0) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight={300}
        textAlign='center'
        px={3}
        mt={3}
      >
        <Typography variant='h4' color='gold.dark' mb={2}>
          Pool not found
        </Typography>
        <Typography variant='baseMd' color='white'>
          Could not find pool on {chainConfig.name}.
          <br />
          Please verify the pool address or switch to Base.
        </Typography>
      </Box>
    )
  }

  // Transform client pool to PoolOverviewWithDelegate
  // Use delegate from Directus (with pool mapping) or fallback to constructed data
  const clientPool = clientPools[0]
  const poolWithDelegate: PoolOverviewWithDelegate = {
    ...clientPool,
    delegate: delegate ?? createFallbackDelegate(clientPool),
  }

  const poolsWithDelegate: PoolOverviewWithDelegate[] = [poolWithDelegate]

  return (
    <Stack spacing={3} mt={3}>
      <PoolOverviewComponent
        pool={poolWithDelegate}
        currentEpoch={currentEpoch}
      />
      <UserLending pool={poolWithDelegate} />
      {/* UserLoyalty only shown on chains with KSU token (not lite deployments) */}
      {!chainConfig.isLiteDeployment && (
        <UserLoyalty
          pools={poolsWithDelegate}
          poolId={poolId}
          currentEpoch={currentEpoch}
          lockPeriods={lockPeriods}
        />
      )}
      <LendingRequestionTransactions
        poolId={poolId}
        currentEpoch={currentEpoch}
      />
      <WithdrawalRequestTransactions
        poolId={poolId}
        currentEpoch={currentEpoch}
      />
    </Stack>
  )
}

export default PoolOverviewTabChainWrapper
