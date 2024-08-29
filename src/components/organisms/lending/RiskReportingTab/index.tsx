import { Stack } from '@mui/material'

import PoolCreditMetrics from '@/components/organisms/lending/RiskReportingTab/PoolCreditMetrics'
import PoolData from '@/components/organisms/lending/RiskReportingTab/PoolData'
import PortfolioLeadingIndicators from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators'

type RiskReportingProps = {
  poolId: string
}

const RiskReportingTab: React.FC<RiskReportingProps> = async () => {
  return (
    <Stack spacing={3} mt={3}>
      <PoolData />
      <PortfolioLeadingIndicators />
      <PoolCreditMetrics />
    </Stack>
  )
}

export default RiskReportingTab
