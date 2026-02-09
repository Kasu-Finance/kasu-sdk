'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Box, CircularProgress, Typography } from '@mui/material'
import { ReactNode } from 'react'

import { useChain } from '@/hooks/context/useChain'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'
import usePoolsWithDelegate from '@/hooks/lending/usePoolsWithDelegate'

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
  // poolOverviews is used for portfolioPools (doesn't need delegate data)
  const { poolOverviews, isLoading: isPoolsLoading } = usePoolOverviews()

  // Fetch pools with delegate data (applies pool mapping for XDC -> Base Directus)
  const { poolsWithDelegate, isLoading: isDelegatesLoading } =
    usePoolsWithDelegate({
      activePools: true,
      oversubscribed: false,
    })

  const isLoading = isPoolsLoading || isDelegatesLoading

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
  if (!poolOverviews || !poolsWithDelegate) {
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

  return (
    <LiteHome
      pools={poolsWithDelegate}
      portfolioPools={poolOverviews}
      currentEpoch={currentEpoch}
    />
  )
}

export default LiteHomeChainWrapper
