import { Box } from '@mui/material'
import { useParams } from 'next/navigation'
import React from 'react'

import usePoolDelegate from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useRiskManagement from '@/hooks/lending/useRiskManagement'

import EmptyState from '@/components/atoms/EmptyState'
import PoolDelegateCard from '@/components/molecules/details/poolDelegateCard/index'
import PoolDetailsCard from '@/components/molecules/details/poolDetailsCard'
import PoolTractionCard from '@/components/molecules/details/PoolTractionCard'
import RiskManagementCard from '@/components/molecules/details/riskManagementCard'
import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'

const PoolDetails: React.FC = () => {
  const { slug: poolId = '' } = useParams()

  const delegateHook = usePoolDelegate(poolId as string)
  const overviewHook = usePoolOverview(poolId as string)
  const riskHook = useRiskManagement(poolId as string)

  const isLoading =
    delegateHook.isLoading || overviewHook.isLoading || riskHook.isLoading

  const noData = !isLoading && !delegateHook.data && !overviewHook.data
  !riskHook.data

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
    return <EmptyState message='No data available for this pool.' />
  }

  return (
    <Box>
      {delegateHook.data && <PoolDelegateCard metrics={delegateHook.data} />}

      {overviewHook.data?.poolDetails && (
        <PoolDetailsCard metrics={overviewHook.data.poolDetails.metrics} />
      )}

      {overviewHook.data?.poolTraction && (
        <PoolTractionCard metrics={overviewHook.data.poolTraction.metrics} />
      )}

      {riskHook.data && (
        <RiskManagementCard riskManagementData={riskHook.data} />
      )}
    </Box>
  )
}

export default PoolDetails
