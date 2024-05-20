'use client'

import { Container } from '@mui/material'

import useLendingTotals from '@/hooks/home/useLendingTotals'
import usePoolDelegate from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import HomeStatsCard from '@/components/molecules/home/HomeStatsCard'
import HomeSkeleton from '@/components/molecules/loaders/HomeSkeleton'
import HomeTabs from '@/components/organisms/home/HomeTabs'

const Lending = () => {
  const { data: pools, isLoading: poolsLoading } = usePoolOverview()
  const { data: poolDelegates, isLoading: poolDelegatesLoading } =
    usePoolDelegate()
  const { lendingTotals } = useLendingTotals()

  if (
    poolsLoading ||
    poolDelegatesLoading ||
    !pools ||
    !poolDelegates ||
    !lendingTotals
  ) {
    return <HomeSkeleton />
  }

  return (
    <Container maxWidth='lg'>
      <HomeStatsCard data={lendingTotals} />
      <HomeTabs pools={pools} poolDelegates={poolDelegates} />
    </Container>
  )
}

export default Lending
