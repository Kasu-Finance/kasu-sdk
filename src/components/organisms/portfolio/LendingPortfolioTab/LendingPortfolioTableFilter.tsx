'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Box, Button } from '@mui/material'

import { useChain } from '@/hooks/context/useChain'
import usePortfolioState from '@/hooks/context/usePortfolioState'
import useCurrentEpoch from '@/hooks/lending/useCurrentEpoch'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'
import { useLiteModeSubgraph } from '@/hooks/lite/useLiteModeSubgraph'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import getTranslation from '@/hooks/useTranslation'

import { DEFAULT_CHAIN_ID } from '@/config/chains'

type LendingPortfolioTableFilterProps = {
  poolOverviews: PoolOverview[]
  currentEpoch: string
}

const LendingPortfolioTableFilter: React.FC<
  LendingPortfolioTableFilterProps
> = ({ poolOverviews, currentEpoch }) => {
  const { t } = getTranslation()
  const { currentChainId, isLiteDeployment } = useChain()

  // Server-side props are only valid for DEFAULT_CHAIN_ID
  const isOnDefaultChain = currentChainId === DEFAULT_CHAIN_ID

  // Client-side data for non-default chains
  const { poolOverviews: clientPoolOverviews, isLoading: isPoolsLoading } =
    usePoolOverviews()
  const { currentEpoch: clientCurrentEpoch, isLoading: isEpochLoading } =
    useCurrentEpoch()

  // Use subgraph data on Lite deployments (XDC) to avoid excessive RPC calls
  const { liteModeData, isLoading: isSubgraphLoading } = useLiteModeSubgraph({
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

  // Only use SDK portfolio data on full deployments (Base)
  const { portfolioLendingPools, isLoading: isSdkLoading } =
    useLendingPortfolioData(effectivePools, effectiveEpoch, {
      enabled:
        !isClientDataLoading && effectivePools.length > 0 && !isLiteDeployment,
    })

  const { filter, setFilter } = usePortfolioState()

  // Check if user has pools - use subgraph on Lite, SDK on full deployment
  const hasPoolData = isLiteDeployment
    ? liteModeData?.pools && liteModeData.pools.length > 0
    : portfolioLendingPools && portfolioLendingPools.length > 0

  const isLoading = isLiteDeployment
    ? isSubgraphLoading || isClientDataLoading
    : isClientDataLoading || isSdkLoading

  if (isLoading || !hasPoolData) {
    return null
  }

  return (
    <Box bgcolor='black' display='flex' p={1} gap={1} borderRadius={30}>
      <Button
        variant='contained'
        sx={{
          borderRadius: 'inherit',
          width: 96,
          bgcolor: !filter.activePools ? 'gray.extraDark' : undefined,
        }}
        onClick={() => setFilter('activePools')}
      >
        {t('general.active')}
      </Button>
      <Button
        variant='contained'
        sx={{
          borderRadius: 'inherit',
          width: 96,
          bgcolor: !filter.closedPools ? 'gray.extraDark' : undefined,
        }}
        onClick={() => setFilter('closedPools')}
      >
        {t('general.closed')}
      </Button>
    </Box>
  )
}

export default LendingPortfolioTableFilter
