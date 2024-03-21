'use client'

import { Box, Container, Typography } from '@mui/material'

import usePoolOverview from '@/hooks/lending/usePoolOverview'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import Carousel from '@/components/molecules/Carousel'
import PageHeader from '@/components/molecules/PageHeader'
import PoolCard from '@/components/molecules/PoolCard'

const Lending = () => {
  const { data: pools, isLoading } = usePoolOverview()

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

  const fakePools = [
    {
      name: 'Pool 1',
      link: 'lending/1',
    },
    {
      name: 'Pool 2',
      link: 'lending/2',
    },
    {
      name: 'Pool 3',
      link: 'lending/pool-3',
    },
    {
      name: 'Pool 4',
      link: 'lending/pool-4',
    },
    {
      name: 'Pool 5',
      link: 'lending/pool-5',
    },
    {
      name: 'Pool 6',
      link: 'lending/pool-6',
    },
  ]

  const hasPools = fakePools && fakePools.length > 0

  const poolsContent = hasPools ? (
    pools.map((pool, index) => (
      <PoolCard name={pool.poolName} link={`lending/${pool.id}`} key={index} />
    ))
  ) : (
    <EmptyCardState message='No pools available.' />
  )

  return (
    <Container maxWidth='lg'>
      <PageHeader title='Lending' />
      <Carousel slidesPerPage={3}>{poolsContent}</Carousel>
    </Container>
  )
}

export default Lending
