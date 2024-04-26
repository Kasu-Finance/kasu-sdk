import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolDetailsSectionIds, PoolTractionMetricIds } from '@/constants'
import formatAmount from '@/utils/formats/formatAmount'
import formatPercentage from '@/utils/formats/formatPercentage'

import { PoolDetailSection, PoolMetric } from '@/types/lending'

const convertToPoolTraction = (overview: PoolOverview): PoolDetailSection => {
  const metrics: PoolMetric[] = [
    {
      id: PoolTractionMetricIds.ValueLocked,
      content: `${formatAmount(overview.totalValueLocked, {
        minDecimals: 2,
      })} M`,
      unit: 'USDC',
    },
    {
      id: PoolTractionMetricIds.Management,
      content: `${formatAmount(overview.loansUnderManagement, {
        minDecimals: 2,
      })}`,
      unit: 'USDC',
    },
    {
      id: PoolTractionMetricIds.Yield,
      content: formatPercentage(overview.yieldEarned),
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
