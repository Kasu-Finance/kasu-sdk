import RiskReportingTabChainWrapper from '@/components/organisms/lending/RiskReportingTab/RiskReportingTabChainWrapper'

import { getRiskReport } from '@/app/_requests/riskReport'

type RiskReportingProps = {
  poolId: string
}

/**
 * Server component that fetches risk report data from the default chain (Base).
 * The RiskReportingTabChainWrapper handles chain-specific rendering.
 */
const RiskReportingTab: React.FC<RiskReportingProps> = async ({ poolId }) => {
  const riskReport = await getRiskReport(poolId)

  return <RiskReportingTabChainWrapper serverRiskReport={riskReport} />
}

export default RiskReportingTab
