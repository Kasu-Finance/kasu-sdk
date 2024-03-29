import { RiskPerformance } from 'kasu-sdk/src/services/DataService/types'

import { PoolDetailsSectionIds, RiskMetricIds } from '@/constants'

import { PoolDetailSection } from '@/types/lending'

const convertToRiskStatus = (riskData: RiskPerformance) => {
  const riskStatus: PoolDetailSection = {
    id: PoolDetailsSectionIds.RiskStatus,
    metrics: [
      {
        id: RiskMetricIds.FirstLoss,
        content: `${riskData.firstLossCapital}`,
        unit: 'USDC',
        isRating: false,
      },
      {
        id: RiskMetricIds.LossRate,
        content: `${riskData.poolLossRate}%`,
        isRating: false,
      },
      {
        id: RiskMetricIds.RiskScore,
        content: riskData.independentRiskScore,
        unit: '/ 5.00',
        isRating: false,
      },
      {
        id: RiskMetricIds.KasuRating,
        content: riskData.communityRating,
        isRating: true,
      },
    ],
  }

  return { riskStatus }
}

export default convertToRiskStatus
