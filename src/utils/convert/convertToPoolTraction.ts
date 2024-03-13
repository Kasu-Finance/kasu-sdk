import { PoolDetailSection, PoolMetric, PoolOverview } from 'kasu-sdk/src/types'

import { PoolDetailsSectionIds, PoolTractionMetricIds } from '@/constants'

const convertToPoolTraction = (overview: PoolOverview): PoolDetailSection => {
  const metrics: PoolMetric[] = [
    {
      id: PoolTractionMetricIds.ValueLocked,
      content: `${overview.totalValueLocked} M`,
      unit: 'USDC',
    },
    {
      id: PoolTractionMetricIds.Management,
      content: `${overview.loansUnderManagement}`,
      unit: 'USDC',
    },
    { id: PoolTractionMetricIds.Yield, content: `${overview.yieldEarned} %` },
    { id: PoolTractionMetricIds.Capacity, content: overview.poolCapacity },
    { id: PoolTractionMetricIds.ActiveLoans, content: overview.activeLoans },
  ]

  return { id: PoolDetailsSectionIds.PoolTraction, metrics }
}

export default convertToPoolTraction
