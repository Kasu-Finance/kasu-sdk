'use client'

import { Box, Container, Typography } from '@mui/material'

import usePoolDelegate from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import PoolTractionCard from '@/components/molecules/details/PoolTractionCard'
import PageHeader from '@/components/molecules/PageHeader'
import HomeTabs from '@/components/organisms/home/HomeTabs'

const mockPoolOverview = {
  totalValueLocked: 1000000,
  loansUnderManagement: 750000,
  totalLoan: 25,
  yieldEarned: 50000,
  totalLoss: 0.0,
}

const Lending = () => {
  const { data: pools, isLoading } = usePoolOverview()
  const { data: poolDelegates } = usePoolDelegate()

  if (isLoading) {
    return (
      <Container maxWidth='lg'>
        <PageHeader title='Lending' />
        <Box display='flex' justifyContent='center' alignItems='center' mt={3}>
          <Typography variant='h6'>Missing Loader...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg'>
      <PoolTractionCard data={mockPoolOverview} />
      <HomeTabs pools={pools} poolDelegates={poolDelegates} />
    </Container>
  )
}

export default Lending
