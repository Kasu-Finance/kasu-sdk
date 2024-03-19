import { PoolDetailSection, RiskManagement } from 'kasu-sdk/src/types'

import { PoolDetailsSectionIds, RiskMetricIds } from '@/constants'

interface RiskManagementSection {
  riskStatus: PoolDetailSection
  security: PoolDetailSection
  criteria: PoolDetailSection
}

const convertRiskManagement = (
  riskData: RiskManagement
): RiskManagementSection => {
  const riskStatus: PoolDetailSection = {
    id: PoolDetailsSectionIds.RiskStatus,
    metrics: [
      {
        id: RiskMetricIds.FirstLoss,
        content: `${riskData.riskPerformance.firstLossCapital}`,
        unit: 'USDC',
        isRating: false,
      },
      {
        id: RiskMetricIds.LossRate,
        content: `${riskData.riskPerformance.poolLossRate}%`,
        isRating: false,
      },
      {
        id: RiskMetricIds.RiskScore,
        content: riskData.riskPerformance.independentRiskScore,
        unit: '/ 5.00',
        isRating: false,
      },
      {
        id: RiskMetricIds.KasuRating,
        content: riskData.riskPerformance.communityRating,
        isRating: true,
      },
    ],
  }

  const security: PoolDetailSection = {
    id: PoolDetailsSectionIds.Security,
    metrics: [
      {
        id: RiskMetricIds.Guarantees,
        content: riskData.securityStructureEndBorrowers.directorsGuarantees,
      },
      {
        id: RiskMetricIds.ChargeAssets,
        content: riskData.securityStructureEndBorrowers.chargeOverBusinessAsset,
      },
      {
        id: RiskMetricIds.BankControl,
        content: riskData.securityStructureEndBorrowers.controlOverBankAccounts,
      },
    ],
  }

  const criteria: PoolDetailSection = {
    id: PoolDetailsSectionIds.Criteria,
    metrics: [
      {
        id: RiskMetricIds.YearsBusiness,
        content: riskData.minimumCriteriaEndBorrowers.minimumYearsInBusiness,
      },
      {
        id: RiskMetricIds.PropertyOwners,
        content: riskData.minimumCriteriaEndBorrowers.propertyOwners,
      },
    ],
  }

  return { riskStatus, security, criteria }
}

export default convertRiskManagement
