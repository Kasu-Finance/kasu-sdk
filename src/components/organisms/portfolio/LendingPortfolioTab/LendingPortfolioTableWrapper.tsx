'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'

import LendingPortfolioTable from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTable'
import LendingPortfolioTableSkeleton from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableSkeleton'

type LendingPortfolioTableWrapperProps = {
  poolOverviews: PoolOverview[]
  currentEpoch: string
}

const LendingPortfolioTableWrapper: React.FC<
  LendingPortfolioTableWrapperProps
> = ({ poolOverviews, currentEpoch }) => {
  const { portfolioLendingPools, isLoading } = useLendingPortfolioData(
    poolOverviews,
    currentEpoch
  )

  if (isLoading || !portfolioLendingPools) {
    return <LendingPortfolioTableSkeleton />
  }

  return (
    <LendingPortfolioTable
      currentEpoch={currentEpoch}
      portfolioPools={portfolioLendingPools}
    />
  )
}

export default LendingPortfolioTableWrapper
