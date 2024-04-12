import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolDetailsSectionIds, PoolTractionMetricIds } from '@/constants'

import { PoolDetailSection, PoolMetric } from '@/types/lending'

const convertToPoolTraction = (overview: PoolOverview): PoolDetailSection => {
  const metrics: PoolMetric[] = [
    {
      id: PoolTractionMetricIds.ValueLocked,
      content: `${overview.totalValueLocked || 'N/A'} M`,
      unit: 'USDC',
    },
    {
      id: PoolTractionMetricIds.Management,
      content: `${overview.loansUnderManagement || 'N/A'}`,
      unit: 'USDC',
    },
    {
      id: PoolTractionMetricIds.Yield,
      content: `${overview.yieldEarned || 'N/A'} %`,
    },
    {
      id: PoolTractionMetricIds.Capacity,
      content: overview.poolCapacity || 'N/A',
    },
    {
      id: PoolTractionMetricIds.ActiveLoans,
      content: overview.activeLoans || 'N/A',
    },
  ]

  return { id: PoolDetailsSectionIds.PoolTraction, metrics }
}

export default convertToPoolTraction
