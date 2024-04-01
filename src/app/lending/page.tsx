'use client'

import { Box, Container, Typography } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'
import { useRouter } from 'next/navigation'

import useModalState from '@/hooks/context/useModalState'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import Carousel from '@/components/molecules/Carousel'
import PageHeader from '@/components/molecules/PageHeader'
import PoolCard from '@/components/molecules/PoolCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import { mockedPoolOverview } from '@/app/mock-data/withdrawMock'
import { Routes } from '@/config/routes'

const Lending = () => {
  const { data: pools, isLoading } = usePoolOverview()
  const router = useRouter()

  const { openModal } = useModalState()

  const handleWithdrawClick = (pool: PoolOverview) => {
    openModal({ name: ModalsKeys.WITHDRAW, poolData: mockedPoolOverview })

    router.push(`${Routes.lending.root.url}?poolId=${pool.id}&step=1`)
  }

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
        key={index}
        poolName={pool.poolName}
        link={`${Routes.lending.root.url}/${pool.id}`}
        handleWithdrawClick={() => handleWithdrawClick(pool)}
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
