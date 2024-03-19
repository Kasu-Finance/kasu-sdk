import { Box } from '@mui/material'
import { useParams } from 'next/navigation'
import React from 'react'

import usePoolDelegate from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useRiskManagement from '@/hooks/lending/useRiskManagement'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import PoolDelegateCard from '@/components/molecules/details/PoolDelegateCard'
import PoolDetailsCard from '@/components/molecules/details/PoolDetailsCard'
import PoolTractionCard from '@/components/molecules/details/PoolTractionCard'
import RiskManagementCard from '@/components/molecules/details/RiskManagementCard'
import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'

const PoolDetails: React.FC = () => {
  const { slug } = useParams()
  const poolId = slug as string

  const delegateHook = usePoolDelegate(poolId)
  const overviewHook = usePoolOverview(poolId)
  const riskHook = useRiskManagement(poolId)

  const isLoading =
    delegateHook.isLoading || overviewHook.isLoading || riskHook.isLoading

  const noData =
    !isLoading && !delegateHook.data && !overviewHook.data && !riskHook.data

  if (isLoading) {
    return (
      <Box>
        <CardSkeleton leftRowNumbers={3} rightRowNumbers={3} />
        <CardSkeleton leftRowNumbers={1} rightRowNumbers={4} />
        <CardSkeleton leftRowNumbers={2} rightRowNumbers={2} />
        <CardSkeleton leftRowNumbers={6} rightRowNumbers={3} />
      </Box>
    )
  }

  if (noData) {
    return <EmptyCardState message='No data available for this pool.' />
  }

  return (
    <Box>
      {delegateHook.data?.length && (
        <PoolDelegateCard data={delegateHook.data[0]} />
      )}

      {overviewHook.data?.length && (
        <PoolDetailsCard data={overviewHook.data[0]} />
      )}

      {overviewHook.data?.length && (
        <PoolTractionCard data={overviewHook.data[0]} />
      )}

      {riskHook.data?.length && <RiskManagementCard data={riskHook.data[0]} />}
    </Box>
  )
}

export default PoolDetails
