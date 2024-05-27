import { Box } from '@mui/material'
import { useParams } from 'next/navigation'
import React from 'react'

import usePoolDelegate from '@/hooks/lending/usePoolDelegate'
import usePoolOverview from '@/hooks/lending/usePoolOverview'
import useRiskManagement from '@/hooks/lending/useRiskManagement'
import useTranslation from '@/hooks/useTranslation'

import EmptyCardState from '@/components/atoms/EmptyCardState'
import PoolDelegateCard from '@/components/molecules/details/PoolDelegateCard'
import PoolDetailsCard from '@/components/molecules/details/PoolDetailsCard'
import PoolTractionCard from '@/components/molecules/details/PoolTractionCard'
import RiskManagementCard from '@/components/molecules/details/RiskManagementCard'
import CardSkeleton from '@/components/molecules/loaders/CardSkeleton'

const PoolDetails: React.FC = () => {
  const { t } = useTranslation()
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
        <CardSkeleton leftRowNumbers={1} rightRowNumbers={1} />
        <CardSkeleton leftRowNumbers={6} rightRowNumbers={3} />
      </Box>
    )
  }

  if (noData) {
    return <EmptyCardState message='No data available for this pool.' />
  }

  return (
    <Box>
      {delegateHook.data && <PoolDelegateCard data={delegateHook.data} />}

      {overviewHook.data?.length && (
        <PoolDetailsCard data={overviewHook.data[0]} />
      )}

      {overviewHook.data?.length && (
        <PoolTractionCard
          data={overviewHook.data[0]}
          title={t('details.poolTraction.title')}
        />
      )}

      {riskHook?.data && <RiskManagementCard data={riskHook.data} />}
    </Box>
  )
}

export default PoolDetails
