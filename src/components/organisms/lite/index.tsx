'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { Grid2, Stack, Typography } from '@mui/material'
import React from 'react'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

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

import PortfolioSummaryLiteProvider from '@/context/portfolioSummaryLite/PortfolioSummaryLiteProvider'

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

  const { portfolioLendingPools, isLoading: isPortfolioLoading } =
    useLendingPortfolioData(pools, currentEpoch)

  const isPortfolioDataLoading = isPortfolioLoading && isAuthenticated
  const hasActiveDeposits = isAuthenticated
    ? Boolean(portfolioLendingPools?.length)
    : true

  return (
    <Grid2 container spacing={3} alignItems='stretch'>
      <Grid2 size={8}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2}>
          <PortfolioSummaryLiteProvider
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
                    hasActiveDeposits={hasActiveDeposits}
                    isPortfolioLoading={isPortfolioDataLoading}
                  />
                  <PendingTransactionRequests currentEpoch={currentEpoch} />
                  <LendingDecisionsPending pools={pools} />
                  <LiteLendingPortfolio
                    portfolioLendingPools={portfolioLendingPools}
                    isLoading={isPortfolioDataLoading}
                    isAuthenticated={isAuthenticated}
                  />
                  <LendingActions
                    pools={activePools}
                    currentEpoch={currentEpoch}
                  />
                </Stack>
              </Stack>
              <Stack spacing={3}>
                <Typography variant='h2' color='gold.dark'>
                  {t('lite.rewardsPortfolio.title')}
                </Typography>
                <Stack spacing={5}>
                  <RewardsBasicStats
                    hasActiveDeposits={hasActiveDeposits}
                    isPortfolioLoading={isPortfolioDataLoading}
                  />
                  <LockingRewards />
                  <NftRewards />
                  <LiteReferralBonus />
                </Stack>
              </Stack>
            </Stack>
          </PortfolioSummaryLiteProvider>
        </WaveBox>
      </Grid2>
      <Grid2 size={4}>
        <WaveBox variant='dark-gray' borderRadius={6} p={2} height='100%'>
          <Stack spacing={4}>
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
              <PoolAccordion pools={activePools} currentEpoch={currentEpoch} />
            </Stack>
          </Stack>
        </WaveBox>
      </Grid2>
    </Grid2>
  )
}

export default LiteModeApp
