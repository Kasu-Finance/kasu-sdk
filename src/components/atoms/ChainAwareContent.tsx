'use client'

import { Box, Typography } from '@mui/material'
import { ReactNode } from 'react'

import { useChain } from '@/hooks/context/useChain'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

type ChainAwareContentProps = {
  children: ReactNode
  /** Content to show when on a chain different from the data's chain */
  comingSoonContent?: ReactNode
}

/**
 * Wrapper that shows "coming soon" content when user is on a chain
 * that doesn't have data yet (e.g., XDC before pools are deployed).
 *
 * Server-rendered data is always from DEFAULT_CHAIN_ID (Base).
 * When user switches to another chain client-side, this component
 * shows appropriate messaging instead of mismatched data.
 */
const ChainAwareContent: React.FC<ChainAwareContentProps> = ({
  children,
  comingSoonContent,
}) => {
  const { currentChainId, chainConfig } = useChain()

  // If user is on a chain different from the data's chain, show coming soon
  if (currentChainId !== DEFAULT_CHAIN_ID) {
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
