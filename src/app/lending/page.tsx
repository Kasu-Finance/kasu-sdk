'use client'

import { Box, Container, Typography } from '@mui/material'

import usePoolOverview from '@/hooks/lending/usePoolOverview'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import Carousel from '@/components/molecules/Carousel'
import PageHeader from '@/components/molecules/PageHeader'
import PoolCard from '@/components/molecules/PoolCard'

import { Routes } from '@/config/routes'

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

  const hasPools = pools && pools.length > 0

  const poolsContent = hasPools ? (
    pools.map((pool, index) => (
      <PoolCard
        name={pool.poolName}
        link={`${Routes.lending.root.url}/${pool.id}`}
        key={index}
      />
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
