'use client'

import { Box, Container, Typography } from '@mui/material'

import useLendingTotals from '@/hooks/home/useLendingTotals'
import usePoolDelegate from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import HomeMetricsCard from '@/components/molecules/home/HomeMetricsCard'
import PageHeader from '@/components/molecules/PageHeader'
import HomeTabs from '@/components/organisms/home/HomeTabs'

const Lending = () => {
  const { data: pools, isLoading } = usePoolOverview()
  const { data: poolDelegates } = usePoolDelegate()
  const { lendingTotals } = useLendingTotals()

  if (isLoading) {
    return (
      <Container maxWidth='lg'>
        <PageHeader title='Lending' />
        <Box display='flex' justifyContent='center' alignItems='center' mt={3}>
          <Typography variant='h6'>Loading...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg'>
      <HomeMetricsCard data={lendingTotals} />
      <HomeTabs pools={pools} poolDelegates={poolDelegates} />
    </Container>
  )
}

export default Lending
