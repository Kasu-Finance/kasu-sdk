'use client'

import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import React from 'react'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'

import LendingPortfolioTable from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTable'
import LendingPortfolioTableSkeleton from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableSkeleton'

type LendingPortfolioTableWrapperProps = {
  poolOverviews: PoolOverview[]
}

const LendingPortfolioTableWrapper: React.FC<
  LendingPortfolioTableWrapperProps
> = ({ poolOverviews }) => {
  const { lendingPortfolioData, isLoading } =
    useLendingPortfolioData(poolOverviews)

  if (isLoading || !lendingPortfolioData?.lendingPools) {
    return <LendingPortfolioTableSkeleton />
  }

  return (
    <LendingPortfolioTable portfolioPools={lendingPortfolioData.lendingPools} />
  )
}

export default LendingPortfolioTableWrapper
