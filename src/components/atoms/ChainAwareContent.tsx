'use client'

import { Box, Typography } from '@mui/material'
import { ReactNode, useEffect, useState } from 'react'

import { useChain } from '@/hooks/context/useChain'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

type ChainAwareContentProps = {
  children: ReactNode
  /** Content to show when on a chain different from the data's chain */
  comingSoonContent?: ReactNode
}

/**
 * Wrapper that shows "coming soon" content when user is on a chain
 * that doesn't have active pools yet.
 *
 * Server-rendered data is always from DEFAULT_CHAIN_ID (Base).
 * When user switches to another chain client-side, this component
 * shows appropriate messaging instead of mismatched data for chains
 * without deployed pools.
 *
 * Chains with poolMetadataMapping (XDC, etc.) have active pools and
 * will render content normally.
 *
 * Uses a mounted state to prevent hydration mismatch.
 */
const ChainAwareContent: React.FC<ChainAwareContentProps> = ({
  children,
  comingSoonContent,
}) => {
  const { currentChainId, chainConfig } = useChain()
  const [hasMounted, setHasMounted] = useState(false)

  // Track client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Check if this chain has active pools
  // - Default chain (Base) always has pools
  // - Other chains have pools if they have a poolMetadataMapping
  const hasActivePools =
    currentChainId === DEFAULT_CHAIN_ID ||
    (chainConfig.poolMetadataMapping &&
      Object.keys(chainConfig.poolMetadataMapping).length > 0)

  // Before mount, always render children (matches server which uses DEFAULT_CHAIN_ID)
  // This prevents hydration mismatch
  if (!hasMounted) {
    return children
  }

  // If chain doesn't have active pools, show coming soon
  if (!hasActivePools) {
    return (
      comingSoonContent ?? (
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
            Coming Soon to {chainConfig.name}
          </Typography>
          <Typography variant='baseMd' color='white'>
            Lending pools on {chainConfig.name} are not yet available.
            <br />
            Switch to Base to access active lending strategies.
          </Typography>
        </Box>
      )
    )
  }

  return children
}

export default ChainAwareContent
