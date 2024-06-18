import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolDetailsMetricIds, PoolDetailsSectionIds } from '@/constants'

import { PoolDetailSection, PoolMetric } from '@/types/lending'

const convertToPoolDetails = (overview: PoolOverview): PoolDetailSection => {
  const metrics: PoolMetric[] = [
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
