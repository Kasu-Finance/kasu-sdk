'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { Grid2, Stack, Typography } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useStakedKSU from '@/hooks/locking/useStakedKSU'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
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

import PortfolioSummaryProvider from '@/context/portfolioSummary/PortfolioSummaryProvider'

import sdkConfig, { USDC } from '@/config/sdk'

import PoolAccordion from './PoolAccordion'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteModeAppProps = {
  pools: PoolOverview[]
  lockPeriods: LockPeriod[]
  activePools: PoolOverviewWithDelegate[]
  currentEpoch: string
}

const LiteModeApp: React.FC<LiteModeAppProps> = ({
  pools,
  currentEpoch,
  lockPeriods,
  activePools,
}) => {
  const { t } = getTranslation()

  const { isAuthenticated } = usePrivyAuthenticated()

  const {
    portfolioLendingPools,
    isLoading: isPortfolioLoading,
    isValidating: isPortfolioValidating,
    error: portfolioError,
  } = useLendingPortfolioData(pools, currentEpoch)

  const [isPortfolioOnchainReady, setIsPortfolioOnchainReady] = useState(false)

  const poolOverviewsKey = useMemo(() => {
    return pools
      .map(
        (pool) =>
          `${pool.id.toLowerCase()}:${pool.tranches
            .map((tranche) => tranche.id.toLowerCase())
            .sort()
            .join(',')}`
      )
      .sort()
      .join('|')
  }, [pools])

  const isPortfolioDataLoading = isPortfolioLoading && isAuthenticated
  const hasActiveDeposits = isAuthenticated
    ? Boolean(portfolioLendingPools?.length)
    : true
  const isPhase1OnchainReady = isAuthenticated ? isPortfolioOnchainReady : true
  const isPhase2Enabled = isPhase1OnchainReady
  const [isPhase3Enabled, setIsPhase3Enabled] = useState(false)
  const [phase4Stage, setPhase4Stage] = useState(0)

  const { isUserBalanceLoading: isKsuBalanceLoading } = useUserBalance(
    sdkConfig.contracts.KSUToken,
    { enabled: isPhase3Enabled }
  )
  const { isUserBalanceLoading: isUsdcBalanceLoading } = useUserBalance(USDC, {
    enabled: isPhase3Enabled,
  })
  const { isLoading: isUserLocksLoading } = useUserLocks({
    enabled: isPhase3Enabled,
  })
  const { isLoading: isStakedKsuLoading } = useStakedKSU({
    enabled: isPhase3Enabled,
  })
  const { isLoading: isKsuPriceLoading } = useKsuPrice({
    enabled: isPhase3Enabled,
  })

  const isPhase3Loading =
    isKsuBalanceLoading ||
    isUsdcBalanceLoading ||
    isUserLocksLoading ||
    isStakedKsuLoading ||
    isKsuPriceLoading
  const isPhase3Ready = isPhase3Enabled && !isPhase3Loading
  const isPhase4Enabled = phase4Stage >= 1
  const isPhase4LockingEnabled = phase4Stage >= 2
  const isPhase4NftEnabled = phase4Stage >= 3
  const isPhase4ReferralEnabled = phase4Stage >= 4
  const isPhase4RightColumnEnabled = phase4Stage >= 5

  const handleLockingRewardsReady = useCallback(() => {
    setPhase4Stage((prev) => (prev < 3 ? 3 : prev))
  }, [])

  const handleNftRewardsReady = useCallback(() => {
    setPhase4Stage((prev) => (prev < 4 ? 4 : prev))
  }, [])

  const handleReferralRewardsReady = useCallback(() => {
    setPhase4Stage((prev) => (prev < 5 ? 5 : prev))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setIsPortfolioOnchainReady(true)
      return
    }

    if (portfolioError && !isPortfolioOnchainReady) {
      setIsPortfolioOnchainReady(true)
      return
    }

    if (
      !isPortfolioOnchainReady &&
      portfolioLendingPools &&
      !isPortfolioLoading &&
      !isPortfolioValidating
    ) {
      setIsPortfolioOnchainReady(true)
    }
  }, [
    isAuthenticated,
    portfolioError,
    isPortfolioOnchainReady,
    portfolioLendingPools,
    isPortfolioLoading,
    isPortfolioValidating,
  ])

  useEffect(() => {
    if (!isAuthenticated) return
    setIsPortfolioOnchainReady(false)
  }, [isAuthenticated, currentEpoch, poolOverviewsKey])

  useEffect(() => {
    if (!isPhase2Enabled) {
      setIsPhase3Enabled(false)
      setPhase4Stage(0)
      return
    }

    const phase3Timer = setTimeout(() => setIsPhase3Enabled(true), 0)

    return () => {
      clearTimeout(phase3Timer)
    }
  }, [isPhase2Enabled])

  useEffect(() => {
    if (!isPhase3Ready) {
      setPhase4Stage(0)
      return
    }

    if (phase4Stage === 0) {
      setPhase4Stage(1)
    }
  }, [isPhase3Ready, phase4Stage])

  useEffect(() => {
    if (phase4Stage === 1) {
      setPhase4Stage(2)
    }
  }, [phase4Stage])

  return (
    <Grid2 container spacing={{ xs: 2, md: 3 }} alignItems='stretch'>
      <Grid2 size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2}>
          <PortfolioSummaryProvider
            currentEpoch={currentEpoch}
            poolOverviews={pools}
            portfolioLendingPools={portfolioLendingPools}
          >
            <Stack spacing={6.5}>
              <Stack spacing={4.5}>
                <Typography variant='h2' color='gold.dark'>
                  {t('lite.lendingPortfolio.title')}
                </Typography>
                <Stack spacing={3}>
                  <LendingBasicStats
                    pools={pools}
                    currentEpoch={currentEpoch}
                    portfolioLendingPools={portfolioLendingPools}
                    hasActiveDeposits={hasActiveDeposits}
                    isPortfolioLoading={isPortfolioDataLoading}
                  />
                  {isPhase2Enabled && (
                    <PendingTransactionRequests currentEpoch={currentEpoch} />
                  )}
                  {isPhase2Enabled && <LendingDecisionsPending pools={pools} />}
                  <LiteLendingPortfolio
                    portfolioLendingPools={portfolioLendingPools}
                    isLoading={isPortfolioDataLoading}
                    isAuthenticated={isAuthenticated}
                  />
                  {isPhase2Enabled && (
                    <LendingActions
                      pools={activePools}
                      currentEpoch={currentEpoch}
                    />
                  )}
                </Stack>
              </Stack>
              {isPhase4Enabled && (
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
                      <LiteReferralBonus onReady={handleReferralRewardsReady} />
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
            {isPhase3Enabled ? (
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
                <LiteModeSkeleton variant='rounded' height={140} width='100%' />
                <LiteModeSkeleton variant='rounded' height={90} width='100%' />
                <LiteModeSkeleton variant='rounded' height={26} width='45%' />
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
            {isPhase4RightColumnEnabled && (
              <>
                <LiteLoyaltyInfo />
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
                    pools={activePools}
                    currentEpoch={currentEpoch}
                    enabled={isPhase4RightColumnEnabled}
                  />
                </Stack>
              </>
            )}
          </Stack>
        </WaveBox>
      </Grid2>
    </Grid2>
  )
}

export default LiteModeApp
