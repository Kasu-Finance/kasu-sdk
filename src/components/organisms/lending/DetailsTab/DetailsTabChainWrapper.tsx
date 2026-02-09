'use client'

import { RiskManagement } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { useChain } from '@/hooks/context/useChain'
import usePoolDelegate, {
  createFallbackDelegate,
} from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import DelegateProfile from '@/components/organisms/lending/DetailsTab/DelegateProfile'
import PoolDetails from '@/components/organisms/lending/DetailsTab/PoolDetails'
import PoolTraction from '@/components/organisms/lending/DetailsTab/PoolTraction'
import RiskManagementComponent from '@/components/organisms/lending/DetailsTab/RiskManagement'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

import { PoolOverviewWithDelegate } from '@/types/page'

type DetailsTabChainWrapperProps = {
  /** Pool ID */
  poolId: string
  /** Server-rendered pool (from default chain, null if not found) */
  serverPool: PoolOverviewWithDelegate | null
  /** Server-rendered risk management data */
  serverRiskManagement: RiskManagement | null
}

/**
 * Chain-aware wrapper for DetailsTab content.
 *
 * On DEFAULT_CHAIN (Base): Uses server-rendered data.
 * On other chains (XDC): Fetches pool data client-side.
 */
const DetailsTabChainWrapper: React.FC<DetailsTabChainWrapperProps> = ({
  poolId,
  serverPool,
  serverRiskManagement,
}) => {
  const { currentChainId, chainConfig } = useChain()
  const isDefaultChain = currentChainId === DEFAULT_CHAIN_ID
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Fetch pool client-side (for non-default chains)
  const { data: clientPools, isLoading, error } = usePoolOverview(poolId)

  // Fetch delegate data with proper pool mapping (XDC -> Base)
  const { delegate, isLoading: isDelegateLoading } = usePoolDelegate(poolId)

  // Loading state helper
  const renderLoading = () => (
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

  // Not found state helper
  const renderNotFound = (message: string) => (
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
        {message}
      </Typography>
    </Box>
  )

  // Before mount, match server rendering
  if (!hasMounted) {
    if (serverPool) {
      return (
        <Stack spacing={3} mt={3}>
          <DelegateProfile pool={serverPool} />
          <PoolDetails pool={serverPool} />
          <PoolTraction pool={serverPool} />
          {serverRiskManagement && (
            <RiskManagementComponent riskManagement={serverRiskManagement} />
          )}
        </Stack>
      )
    }
    return renderLoading()
  }

  // On default chain with server data
  if (isDefaultChain && serverPool) {
    return (
      <Stack spacing={3} mt={3}>
        <DelegateProfile pool={serverPool} />
        <PoolDetails pool={serverPool} />
        <PoolTraction pool={serverPool} />
        {serverRiskManagement && (
          <RiskManagementComponent riskManagement={serverRiskManagement} />
        )}
      </Stack>
    )
  }

  // On default chain but no server data (XDC pool on Base)
  if (isDefaultChain && !serverPool) {
    return renderNotFound(
      'This pool address does not exist on Base. Switch to XDC to view this pool.'
    )
  }

  // Non-default chain - loading
  if (isLoading || isDelegateLoading) {
    return renderLoading()
  }

  // Non-default chain - error or no data
  if (error || !clientPools || clientPools.length === 0) {
    return renderNotFound(`Could not find pool on ${chainConfig.name}.`)
  }

  // Transform client pool to PoolOverviewWithDelegate
  // Use delegate from Directus (with pool mapping) or fallback to constructed data
  const clientPool = clientPools[0]
  const poolWithDelegate: PoolOverviewWithDelegate = {
    ...clientPool,
    delegate: delegate ?? createFallbackDelegate(clientPool),
  }

  return (
    <Stack spacing={3} mt={3}>
      <DelegateProfile pool={poolWithDelegate} />
      <PoolDetails pool={poolWithDelegate} />
      <PoolTraction pool={poolWithDelegate} />
      {/* Risk management data not available client-side for non-default chains yet */}
    </Stack>
  )
}

export default DetailsTabChainWrapper
