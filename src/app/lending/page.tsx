'use client'

import { Box, Container, Typography } from '@mui/material'
import { PoolOverview } from 'kasu-sdk/src/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import usePoolOverview from '@/hooks/lending/usePoolOverview'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import Carousel from '@/components/molecules/Carousel'
import WithdrawModal from '@/components/molecules/lending/WithdrawModal'
import PageHeader from '@/components/molecules/PageHeader'
import PoolCard from '@/components/molecules/PoolCard'

import { ModalsKeys } from '@/context/modal/modal.types'

const Lending = () => {
  const { data: pools, isLoading } = usePoolOverview()
  const [selectedPool, setSelectedPool] = useState<PoolOverview | null>(null)
  const router = useRouter()

  const { openModal } = useModalState()

  const handleWithdrawClick = (pool: any) => {
    setSelectedPool(pool)
    openModal({ name: ModalsKeys.WITHDRAW })
    router.push('/lending?step=1')
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
        poolName={pool.poolName}
        link={`lending/${pool.id}`}
        key={index}
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

      {selectedPool && (
        <WithdrawModal key={selectedPool?.id} pool={selectedPool} />
      )}
    </Container>
  )
}

export default Lending
