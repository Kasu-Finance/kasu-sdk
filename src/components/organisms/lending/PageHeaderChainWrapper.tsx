'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk'
import { Avatar, Box, Button, Skeleton, Typography } from '@mui/material'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useChain } from '@/hooks/context/useChain'
import usePoolOverview from '@/hooks/lending/usePoolOverview'
import getTranslation from '@/hooks/useTranslation'

import { ChevronLeftRoundedIcon } from '@/assets/icons'

import { DEFAULT_CHAIN_ID } from '@/config/chains'
import { Routes } from '@/config/routes'
import { mergeSubheading } from '@/utils'

type PageHeaderChainWrapperProps = {
  poolId: string
  /** Server-rendered pool (from default chain, null if not found) */
  serverPool: PoolOverview | null
}

/**
 * Chain-aware wrapper for PageHeader.
 *
 * On DEFAULT_CHAIN (Base): Uses server-rendered pool data.
 * On other chains (XDC): Fetches pool data client-side.
 */
const PageHeaderChainWrapper: React.FC<PageHeaderChainWrapperProps> = ({
  poolId,
  serverPool,
}) => {
  const { t } = getTranslation()
  const { currentChainId } = useChain()
  const isDefaultChain = currentChainId === DEFAULT_CHAIN_ID
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Fetch pool client-side (for non-default chains)
  const { data: clientPools, isLoading } = usePoolOverview(poolId)

  // Determine which pool to use
  let pool: PoolOverview | null = null

  if (!hasMounted) {
    // Before mount, use server pool (if available)
    pool = serverPool
  } else if (isDefaultChain) {
    // On default chain, use server pool
    pool = serverPool
  } else {
    // On other chains, use client-fetched pool
    pool = clientPools?.[0] ?? null
  }

  // Show skeleton while loading on non-default chains
  if (hasMounted && !isDefaultChain && isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box display='flex' alignItems='center' gap={2}>
          <Skeleton variant='circular' width={64} height={64} />
          <Skeleton variant='text' width={200} height={40} />
        </Box>
        <Skeleton variant='rectangular' width={233} height={42} />
      </Box>
    )
  }

  // No pool found
  if (!pool) {
    return null
  }

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      mb={3}
    >
      <Box display='flex' alignItems='center' gap={2}>
        <Avatar
          variant='circular'
          src={pool.thumbnailImageUrl}
          alt={pool.poolName}
          sx={{ width: 64, height: 64, bgcolor: 'gray.extraDark' }}
        />
        <Typography variant='h2'>
          {mergeSubheading(pool.poolName, pool.subheading)}
        </Typography>
      </Box>
      <Button
        LinkComponent={Link}
        href={Routes.lending.root.url}
        startIcon={<ChevronLeftRoundedIcon />}
        sx={{
          textTransform: 'unset',
          minWidth: 233,
          '.MuiButton-icon': {
            mr: '13px',
          },
        }}
      >
        {t('general.goBack')}
      </Button>
    </Box>
  )
}

export default PageHeaderChainWrapper
