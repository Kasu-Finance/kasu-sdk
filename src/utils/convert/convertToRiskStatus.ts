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
        content: `${formatAmount(riskData.firstLossCapital || '0')}`,
        unit: 'USDC',
        isRating: false,
      },
      {
        id: RiskMetricIds.LossRate,
        content: formatPercentage(riskData.poolLossRate || '0'),
        isRating: false,
      },
      {
        id: RiskMetricIds.RiskScore,
        content: `${formatAmount(riskData.independentRiskScore || '0')}`,
        unit: '',
        isRating: false,
      },
      {
        id: RiskMetricIds.KasuRating,
        content: `${formatAmount(riskData.communityRating || '0')}`,
        isRating: true,
      },
    ],
  }

  return { riskStatus }
}

export default convertToRiskStatus
