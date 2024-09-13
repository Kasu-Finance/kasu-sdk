'use client'

import { Stack, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import Image from 'next/image'
import React from 'react'

import useLendingPortfolioData from '@/hooks/portfolio/useLendingPortfolioData'

import LendingPortfolioTable from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTable'
import LendingPortfolioTableSkeleton from '@/components/organisms/portfolio/LendingPortfolioTab/LendingPortfolioTableSkeleton'

import Cat from '@/images/cat.png'

type LendingPortfolioTableWrapperProps = {
  poolOverviews: PoolOverview[]
}

const LendingPortfolioTableWrapper: React.FC<
  LendingPortfolioTableWrapperProps
> = ({ poolOverviews }) => {
  const { lendingPortfolioData, isLoading } =
    useLendingPortfolioData(poolOverviews)

  if (isLoading) {
    return <LendingPortfolioTableSkeleton />
  }

  if (!lendingPortfolioData?.lendingPools.length) {
    return (
      <Stack alignItems='center' pb={3}>
        <Image src={Cat} alt='Cat' />
        <Typography variant='h4'>
          You have not deposited into any lending strategies.
        </Typography>
      </Stack>
    )
  }

  return (
    <LendingPortfolioTable portfolioPools={lendingPortfolioData.lendingPools} />
  )
}

export default LendingPortfolioTableWrapper
