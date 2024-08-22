import { Stack } from '@mui/material'

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
    </Stack>
  )
}

export default RiskReportingTab
