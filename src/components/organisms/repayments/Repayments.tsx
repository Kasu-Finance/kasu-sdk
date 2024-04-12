import { Box } from '@mui/material'
import { useParams } from 'next/navigation'
import React from 'react'

import usePoolRepayments from '@/hooks/lending/usePoolRepayments'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'
import RepaymentsCard from '@/components/molecules/repayments/RepaymentsCard'

const Repayments: React.FC = () => {
  const { slug } = useParams()
  const poolId = slug as string

  const { data, isLoading } = usePoolRepayments(poolId)

  if (isLoading) {
    return (
      <CardSkeleton
        leftRowNumbers={3}
        rightRowNumbers={3}
        showSubtitle
        titleStyle={{ width: '15%' }}
        subtitleStyle={{ width: '20%' }}
      />
    )
  }

  return (
    <Box mt={3}>
      {data ? (
        <RepaymentsCard data={data} />
      ) : (
        <EmptyCardState
          message={'No data available for this pool: ' + poolId}
        />
      )}
    </Box>
  )
}

export default Repayments
