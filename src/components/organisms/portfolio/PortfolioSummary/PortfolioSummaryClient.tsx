'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { Grid2 } from '@mui/material'
import React from 'react'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'

import InfoColumn from '@/components/atoms/InfoColumn'
import WaveBox from '@/components/atoms/WaveBox'
import LifetimeFeesEarned from '@/components/organisms/portfolio/PortfolioSummary/LifetimeFeesEarned'
import LifetimeInterestEarnings from '@/components/organisms/portfolio/PortfolioSummary/LifetimeInterestEarnings'
import LifetimeKsuBonusRewards from '@/components/organisms/portfolio/PortfolioSummary/LifetimeKsuBonusRewards'
import TotalKsuLocked from '@/components/organisms/portfolio/PortfolioSummary/TotalKsuLocked'
import TotalLendingBalance from '@/components/organisms/portfolio/PortfolioSummary/TotalLendingBalance'
import WeightedAverageApy from '@/components/organisms/portfolio/PortfolioSummary/WeightedAverageApy'

import PortfolioSummaryProvider from '@/context/portfolioSummary/PortfolioSummaryProvider'

type PortfolioSummaryClientProps = {
  currentEpoch: string
  poolOverviews: PoolOverview[]
  titleMap: {
    totalKsuLocked: string
    totalKsuLockedTooltip: string
    totalLendingBalance: string
    totalLendingBalanceTooltip: string
    weightedAverageApy: string
    weightedAverageApyTooltip: string
    lifetimeInterestEarnings: string
    lifetimeInterestEarningsTooltip: string
    lifetimeKsuBonusRewards: string
    lifetimeKsuBonusRewardsTooltip: string
    lifetimeFeesEarned: string
    lifetimeFeesEarnedTooltip: string
  }
}

const PortfolioSummaryClient: React.FC<PortfolioSummaryClientProps> = ({
  currentEpoch,
  poolOverviews,
  titleMap,
}) => {
  const { portfolioLendingPools } = useLendingPortfolioData(
    poolOverviews,
    currentEpoch
  )

  return (
    <PortfolioSummaryProvider
      currentEpoch={currentEpoch}
      poolOverviews={poolOverviews}
      portfolioLendingPools={portfolioLendingPools}
    >
      <Grid2 container spacing={4} mb={5}>
        <Grid2 size={4}>
          <WaveBox borderRadius={2} py={4} px={2} height={116}>
            <InfoColumn
              title={titleMap.totalKsuLocked}
              toolTipInfo={titleMap.totalKsuLockedTooltip}
              metric={<TotalKsuLocked />}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={4}>
          <WaveBox borderRadius={2} py={4} px={2} height={116}>
            <InfoColumn
              title={titleMap.totalLendingBalance}
              toolTipInfo={titleMap.totalLendingBalanceTooltip}
              metric={<TotalLendingBalance />}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={4}>
          <WaveBox borderRadius={2} py={4} px={2} height={116}>
            <InfoColumn
              title={titleMap.weightedAverageApy}
              toolTipInfo={titleMap.weightedAverageApyTooltip}
              metric={<WeightedAverageApy />}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={4}>
          <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
            <InfoColumn
              title={titleMap.lifetimeInterestEarnings}
              toolTipInfo={titleMap.lifetimeInterestEarningsTooltip}
              metric={<LifetimeInterestEarnings />}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={4}>
          <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
            <InfoColumn
              title={titleMap.lifetimeKsuBonusRewards}
              toolTipInfo={titleMap.lifetimeKsuBonusRewardsTooltip}
              metric={<LifetimeKsuBonusRewards />}
            />
          </WaveBox>
        </Grid2>
        <Grid2 size={4}>
          <WaveBox borderRadius={2} py={4} px={2} height={116} variant='gray'>
            <InfoColumn
              title={titleMap.lifetimeFeesEarned}
              toolTipInfo={titleMap.lifetimeFeesEarnedTooltip}
              metric={<LifetimeFeesEarned />}
            />
          </WaveBox>
        </Grid2>
      </Grid2>
    </PortfolioSummaryProvider>
  )
}

export default PortfolioSummaryClient
