import { RiskPerformance } from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolDetailsSectionIds, RiskMetricIds } from '@/constants'
import formatAmount from '@/utils/formats/formatAmount'
import formatPercentage from '@/utils/formats/formatPercentage'

import { PoolDetailSection } from '@/types/lending'

const convertToRiskStatus = (riskData: RiskPerformance) => {
  const riskStatus: PoolDetailSection = {
    id: PoolDetailsSectionIds.RiskStatus,
    metrics: [
      {
        id: RiskMetricIds.FirstLoss,
        content: `${formatAmount(riskData.firstLossCapital)}`,
        unit: 'USDC',
        isRating: false,
      },
      {
        id: RiskMetricIds.LossRate,
        content: formatPercentage(riskData.poolLossRate),
        isRating: false,
      },
      {
        id: RiskMetricIds.RiskScore,
        content: `${formatAmount(riskData.independentRiskScore)}`,
        unit: '/ 5.00',
        isRating: false,
      },
      {
        id: RiskMetricIds.KasuRating,
        content: `${formatAmount(riskData.communityRating)}`,
        isRating: true,
      },
    ],
  }

  return { riskStatus }
}

export default convertToRiskStatus
