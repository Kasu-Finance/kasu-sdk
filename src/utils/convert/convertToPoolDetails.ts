import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolDetailsMetricIds, PoolDetailsSectionIds } from '@/constants'
import formatAmount from '@/utils/formats/formatAmount'
import { getAverageApyAndTotal } from '@/utils/lending'

import { PoolDetailSection, PoolMetric } from '@/types/lending'

const convertToPoolDetails = (overview: PoolOverview): PoolDetailSection => {
  const tranchesTotal = getAverageApyAndTotal(overview?.tranches || [])

  const metrics: PoolMetric[] = [
    {
      id: PoolDetailsMetricIds.APY,
      content: `${formatAmount(tranchesTotal.averageApy * 100) + ' %'}`,
    },
    { id: PoolDetailsMetricIds.AssetClass, content: overview.assetClass },
    {
      id: PoolDetailsMetricIds.ExposureIndustry,
      content: overview.industryExposure,
    },
    {
      id: PoolDetailsMetricIds.StructureApy,
      content: overview.poolApyStructure,
    },
    { id: PoolDetailsMetricIds.Term, content: overview.poolInvestmentTerm },
    { id: PoolDetailsMetricIds.Loan, content: overview.loanStructure },
  ]

  return { id: PoolDetailsSectionIds.PoolDetails, metrics }
}

export default convertToPoolDetails
