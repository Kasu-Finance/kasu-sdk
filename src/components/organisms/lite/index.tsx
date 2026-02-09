'use client'

import { LockPeriod, PoolOverview } from '@kasufinance/kasu-sdk'
import { Grid2, Stack, Typography } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'

import { useChain } from '@/hooks/context/useChain'
import { useSdkState } from '@/hooks/context/useSdk'
import useCurrentEpoch from '@/hooks/lending/useCurrentEpoch'
import usePoolOverviews from '@/hooks/lending/usePoolOverviews'
import usePoolsWithDelegate from '@/hooks/lending/usePoolsWithDelegate'
import { useLiteModeSubgraph } from '@/hooks/lite/useLiteModeSubgraph'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useUserBalance from '@/hooks/web3/useUserBalance'

import LiteModeSkeleton from '@/components/atoms/LiteModeSkeleton'
import WaveBox from '@/components/atoms/WaveBox'
import LendingActions from '@/components/organisms/lite/LendingActions'
import LendingBasicStats from '@/components/organisms/lite/LendingBasicStats'
import LendingDecisionsPending from '@/components/organisms/lite/LendingDecisionsPending'
import LiteLendingPortfolio from '@/components/organisms/lite/LiteLendingPortfolio'
import LiteLoyaltyInfo from '@/components/organisms/lite/LiteLoyaltyInfo'
import LiteReferralBonus from '@/components/organisms/lite/LiteReferralBonus'
import LockActions from '@/components/organisms/lite/LockActions'
import LockBasicStats from '@/components/organisms/lite/LockBasicStats'
import LockingRewards from '@/components/organisms/lite/LockingRewards'
import NftRewards from '@/components/organisms/lite/NftRewards'
import PendingTransactionRequests from '@/components/organisms/lite/PendingTransactionRequests'
import RewardsBasicStats from '@/components/organisms/lite/RewardsBasicStats'

import { LiteModeSubgraphProvider } from '@/context/liteModeSubgraph'
import PortfolioSummaryProvider from '@/context/portfolioSummary/PortfolioSummaryProvider'

import { DEFAULT_CHAIN_ID } from '@/config/chains'
import sdkConfig from '@/config/sdk'

import PoolAccordion from './PoolAccordion'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteModeAppProps = {
  pools: PoolOverview[]
  lockPeriods: LockPeriod[]
  activePools: PoolOverviewWithDelegate[]
  currentEpoch: string
}

/**
 * LiteModeApp with optimized data loading.
 *
 * Data loading strategy:
 * 1. Subgraph query (via useLiteModeSubgraph): Fetches portfolio, locks, KSU price in 1 query
 * 2. SDK portfolio data (via useLendingPortfolioData): Kept for PortfolioSummaryProvider compatibility
 * 3. Token balances (via useUserBalance): Must be RPC - real-time on-chain state
 *
 * Loading phases simplified:
 * - Phase 1: Subgraph data ready
 * - Phase 2: Token balances ready (parallel with Phase 1)
 * - Phase 3+: Child component rewards (sequential for UX)
 */
const LiteModeApp: React.FC<LiteModeAppProps> = ({
  pools,
  currentEpoch,
  lockPeriods,
  activePools,
}) => {
  const { t } = getTranslation()
  const { isLiteDeployment, currentChainId, chainConfig } = useChain()
  const { isChainTransitioning } = useSdkState()

  // Server-side props (pools, currentEpoch) are always for DEFAULT_CHAIN_ID.
  // Only use SDK portfolio data when on the default chain.
  const isOnDefaultChain = currentChainId === DEFAULT_CHAIN_ID

  const { isAuthenticated } = usePrivyAuthenticated()

  // Client-side data for non-default chains
  // Server-side props are only valid for default chain
  const { poolOverviews: clientPoolOverviews, isLoading: isPoolsLoading } =
    usePoolOverviews()
  const { currentEpoch: clientCurrentEpoch, isLoading: isEpochLoading } =
    useCurrentEpoch()
  const {
    poolsWithDelegate: clientPoolsWithDelegate,
    isLoading: isPoolsWithDelegateLoading,
  } = usePoolsWithDelegate()

  // Use server-side data on default chain, client-side on others
  const effectivePools = isOnDefaultChain ? pools : (clientPoolOverviews ?? [])
  const effectiveEpoch = isOnDefaultChain
    ? currentEpoch
    : (clientCurrentEpoch ?? currentEpoch)
  const effectiveActivePools = isOnDefaultChain
    ? activePools
    : clientPoolsWithDelegate

  // Track if client-side data is still loading (for non-default chains)
  const isClientDataLoading =
    !isOnDefaultChain &&
    (isPoolsLoading || isEpochLoading || isPoolsWithDelegateLoading)

  // Subgraph data - fetches portfolio, locks, KSU price in 1 query
  const {
    liteModeData,
    isLoading: isSubgraphLoading,
    isValidating: isSubgraphValidating,
    error: subgraphError,
  } = useLiteModeSubgraph()

  // SDK portfolio data - kept for PortfolioSummaryProvider compatibility
  // This will be phased out once child components use subgraph context
  // NOTE: Only enabled on default chain because server-side props are for that chain
  const {
    portfolioLendingPools,
    isLoading: isPortfolioLoading,
    isValidating: isPortfolioValidating,
    error: portfolioError,
  } = useLendingPortfolioData(pools, currentEpoch, {
    enabled: isOnDefaultChain,
  })

  // Token balances - must be RPC (real-time on-chain state)
  // These run in parallel with subgraph query
  // KSU balance only needed on full deployments (not XDC)
  const { hasLoaded: ksuLoaded } = useUserBalance(
    sdkConfig.contracts.KSUToken,
    {
      enabled: isAuthenticated && !isLiteDeployment && !isChainTransitioning,
    }
  )
  const { hasLoaded: usdcLoaded } = useUserBalance(chainConfig.usdc, {
    enabled: isAuthenticated && !isChainTransitioning,
  })

  // Phase tracking for rewards section (child components still have sequential loading)
  const [phase4Stage, setPhase4Stage] = useState(0)

  // During chain transition, treat everything as loading
  const isSubgraphReady = isChainTransitioning
    ? false
    : isAuthenticated
      ? !isSubgraphLoading &&
        !isSubgraphValidating &&
        (liteModeData || subgraphError)
      : true

  // Portfolio SDK data is only available on default chain
  // On other chains, we rely solely on subgraph data
  const isPortfolioReady = isChainTransitioning
    ? false
    : !isOnDefaultChain
      ? true // Skip waiting for portfolio data on non-default chains
      : isAuthenticated
        ? !isPortfolioLoading &&
          !isPortfolioValidating &&
          (portfolioLendingPools || portfolioError)
        : true

  // On lite deployments, we don't need KSU balance
  const isTokenBalancesReady = isChainTransitioning
    ? false
    : isAuthenticated
      ? isLiteDeployment
        ? usdcLoaded
        : ksuLoaded && usdcLoaded
      : true

  // Main content can show once subgraph OR portfolio data is ready
  const isMainContentReady = isSubgraphReady || isPortfolioReady

  // Right panel (Buy & Lock) needs token balances
  const isRightPanelReady = isMainContentReady && isTokenBalancesReady

  // Rewards section phases
  const isPhase4Enabled = phase4Stage >= 1
  const isPhase4LockingEnabled = phase4Stage >= 2
  const isPhase4NftEnabled = phase4Stage >= 3
  const isPhase4ReferralEnabled = phase4Stage >= 4
  const isPhase4RightColumnEnabled = phase4Stage >= 5

  // Clear stale data during chain transition to prevent showing old chain's data
  const safePortfolioLendingPools = isChainTransitioning
    ? undefined
    : portfolioLendingPools
  const safeLiteModeData = isChainTransitioning ? undefined : liteModeData

  // During chain transition, assume deposits exist to avoid "no deposits" flash
  // On non-default chains, portfolio data is not available - rely on subgraph only
  const hasActiveDeposits = isChainTransitioning
    ? true
    : isAuthenticated
      ? Boolean(
          (isOnDefaultChain && safePortfolioLendingPools?.length) ||
            safeLiteModeData?.pools.length
        )
      : true

  // On non-default chains, portfolio SDK data is disabled, so only check subgraph
  const isPortfolioDataLoading =
    ((isOnDefaultChain && isPortfolioLoading) ||
      isSubgraphLoading ||
      isChainTransitioning) &&
    isAuthenticated

  // Callbacks for child component ready signals
  const handleLockingRewardsReady = useCallback(() => {
    setPhase4Stage((prev) => (prev < 3 ? 3 : prev))
  }, [])

  const handleNftRewardsReady = useCallback(() => {
    setPhase4Stage((prev) => (prev < 4 ? 4 : prev))
  }, [])

  const handleReferralRewardsReady = useCallback(() => {
    setPhase4Stage((prev) => (prev < 5 ? 5 : prev))
  }, [])

  // Enable Phase 4 (rewards) once right panel is ready
  useEffect(() => {
    if (!isRightPanelReady) {
      setPhase4Stage(0)
      return
    }

    if (phase4Stage === 0) {
      setPhase4Stage(1)
    }
  }, [isRightPanelReady, phase4Stage])

  // Auto-advance phase 4 stages
  useEffect(() => {
    if (phase4Stage === 1) {
      setPhase4Stage(2)
    }
  }, [phase4Stage])

  return (
    <LiteModeSubgraphProvider>
      <Grid2 container spacing={{ xs: 2, md: 3 }} alignItems='stretch'>
        <Grid2 size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
          <WaveBox variant='dark-gray' borderRadius={6} p={2}>
            <PortfolioSummaryProvider
              currentEpoch={effectiveEpoch}
              poolOverviews={effectivePools}
              portfolioLendingPools={safePortfolioLendingPools}
            >
              <Stack spacing={6.5}>
                <Stack spacing={4.5}>
                  <Typography variant='h2' color='gold.dark'>
                    {t('lite.lendingPortfolio.title')}
                  </Typography>
                  <Stack spacing={3}>
                    <LendingBasicStats
                      pools={effectivePools}
                      currentEpoch={effectiveEpoch}
                      portfolioLendingPools={safePortfolioLendingPools}
                      hasActiveDeposits={hasActiveDeposits}
                      isPortfolioLoading={
                        isPortfolioDataLoading || isClientDataLoading
                      }
                    />
                    {isMainContentReady && !isClientDataLoading && (
                      <PendingTransactionRequests
                        currentEpoch={effectiveEpoch}
                      />
                    )}
                    {isMainContentReady && !isClientDataLoading && (
                      <LendingDecisionsPending pools={effectivePools} />
                    )}
                    <LiteLendingPortfolio
                      portfolioLendingPools={safePortfolioLendingPools}
                      isLoading={isPortfolioDataLoading}
                      isAuthenticated={isAuthenticated}
                    />
                    {isMainContentReady &&
                      !isClientDataLoading &&
                      effectiveActivePools.length > 0 && (
                        <LendingActions
                          pools={effectiveActivePools}
                          currentEpoch={effectiveEpoch}
                        />
                      )}
                  </Stack>
                </Stack>
                {/* Rewards Portfolio - only on full deployments (not XDC) */}
                {isPhase4Enabled && !isLiteDeployment && (
                  <Stack spacing={3}>
                    <Typography variant='h2' color='gold.dark'>
                      {t('lite.rewardsPortfolio.title')}
                    </Typography>
                    <Stack spacing={5}>
                      <RewardsBasicStats
                        hasActiveDeposits={hasActiveDeposits}
                        isPortfolioLoading={isPortfolioDataLoading}
                      />
                      {isPhase4LockingEnabled && (
                        <LockingRewards onReady={handleLockingRewardsReady} />
                      )}
                      {isPhase4NftEnabled && (
                        <NftRewards onReady={handleNftRewardsReady} />
                      )}
                      {isPhase4ReferralEnabled && (
                        <LiteReferralBonus
                          onReady={handleReferralRewardsReady}
                        />
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </PortfolioSummaryProvider>
          </WaveBox>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
          <WaveBox
            variant='dark-gray'
            borderRadius={6}
            p={2}
            height={{ xs: 'auto', md: '100%' }}
          >
            <Stack spacing={{ xs: 3, md: 4 }}>
              {/* Buy & Lock section - only on full deployments (not XDC) */}
              {!isLiteDeployment && (
                <>
                  {isRightPanelReady ? (
                    <>
                      <Typography
                        textAlign='center'
                        maxWidth={330}
                        variant='h3'
                        color='gold.dark'
                        mt={0.5}
                      >
                        {t('lite.buyAndLock.title')}
                      </Typography>
                      <Stack>
                        <LockBasicStats />
                        <LockActions lockPeriods={lockPeriods} />
                      </Stack>
                    </>
                  ) : (
                    <Stack spacing={2}>
                      <LiteModeSkeleton
                        variant='rounded'
                        height={30}
                        width='70%'
                        sx={{ mx: 'auto', mt: 0.5 }}
                      />
                      <LiteModeSkeleton
                        variant='rounded'
                        height={140}
                        width='100%'
                      />
                      <LiteModeSkeleton
                        variant='rounded'
                        height={90}
                        width='100%'
                      />
                      <LiteModeSkeleton
                        variant='rounded'
                        height={26}
                        width='45%'
                      />
                      <Grid2 container spacing={{ xs: 2, md: 2 }}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <LiteModeSkeleton variant='rounded' height={44} />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <LiteModeSkeleton variant='rounded' height={44} />
                        </Grid2>
                      </Grid2>
                    </Stack>
                  )}
                </>
              )}
              {/* Loyalty info - only on full deployments (not XDC) */}
              {isPhase4RightColumnEnabled && !isLiteDeployment && (
                <LiteLoyaltyInfo />
              )}
              {/* Lending Strategies - always visible */}
              {(isPhase4RightColumnEnabled || isLiteDeployment) && (
                <Stack spacing={2}>
                  <Typography
                    variant='h3'
                    color='gold.dark'
                    textTransform='capitalize'
                    textAlign='center'
                  >
                    Lending Strategies
                  </Typography>
                  <PoolAccordion
                    pools={effectiveActivePools}
                    currentEpoch={effectiveEpoch}
                    enabled={
                      (isPhase4RightColumnEnabled || isLiteDeployment) &&
                      !isClientDataLoading
                    }
                  />
                </Stack>
              )}
            </Stack>
          </WaveBox>
        </Grid2>
      </Grid2>
    </LiteModeSubgraphProvider>
  )
}

export default LiteModeApp
