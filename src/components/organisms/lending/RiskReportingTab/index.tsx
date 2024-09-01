import { Stack } from '@mui/material'

import BadAndDoubtfulDebts from '@/components/organisms/lending/RiskReportingTab/BadAndDoubtfulDebts'
import PoolCreditMetrics from '@/components/organisms/lending/RiskReportingTab/PoolCreditMetrics'
import PoolData from '@/components/organisms/lending/RiskReportingTab/PoolData'
import PortfolioLeadingIndicators from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators'

import { getBadAndDoubtfulDebts } from '@/app/requests/badAndDoubltDebts'
import { getPoolCreditMetrics } from '@/app/requests/poolCreditMetrics'

type RiskReportingProps = {
  poolId: string
}

const RiskReportingTab: React.FC<RiskReportingProps> = async ({ poolId }) => {
  const poolCreditMetrics = await getPoolCreditMetrics(poolId)
  const debts = await getBadAndDoubtfulDebts(poolId)

  return (
    <Stack spacing={3} mt={3}>
      <PoolData />
      <PortfolioLeadingIndicators />
      {poolCreditMetrics && (
        <PoolCreditMetrics poolCreditMetrics={poolCreditMetrics} />
      )}
      {debts && <BadAndDoubtfulDebts badAndDoubltfulDebts={debts} />}
    </Stack>
  )
}

export default RiskReportingTab
