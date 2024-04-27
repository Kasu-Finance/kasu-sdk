'use client'

import { Box, Container, Typography } from '@mui/material'

import usePoolDelegate from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import HomeMetricsCard, {
  HomeMetricData,
} from '@/components/molecules/home/HomeMetricsCard'
import PageHeader from '@/components/molecules/PageHeader'
import HomeTabs from '@/components/organisms/home/HomeTabs'

const mockPoolOverview: HomeMetricData = {
  totalValueLocked: 1000000,
  loansUnderManagement: 750000,
  totalFunds: 25,
  yieldEarned: 50000,
  totalLossRate: 0.0,
}

const Lending = () => {
  const { data: pools, isLoading } = usePoolOverview()
  const { data: poolDelegates } = usePoolDelegate()

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
      <HomeMetricsCard data={mockPoolOverview} />
      <HomeTabs pools={pools} poolDelegates={poolDelegates} />
    </Container>
  )
}

export default Lending
