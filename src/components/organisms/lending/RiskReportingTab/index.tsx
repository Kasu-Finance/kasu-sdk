import { Stack } from '@mui/material'

import BadAndDoubtfulDebts from '@/components/organisms/lending/RiskReportingTab/BadAndDoubtfulDebts'
import FinancialReportingDocuments from '@/components/organisms/lending/RiskReportingTab/FinancialReportingDocuments'
import PoolCreditMetrics from '@/components/organisms/lending/RiskReportingTab/PoolCreditMetrics'
import PoolData from '@/components/organisms/lending/RiskReportingTab/PoolData'
import PortfolioLeadingIndicators from '@/components/organisms/lending/RiskReportingTab/PortfolioLeadingIndicators'

import { getBadAndDoubtfulDebts } from '@/app/_requests/badAndDoubltDebts'
import { getFinancialReportingDocuments } from '@/app/_requests/financialReportingDocuments'
import { getPoolCreditMetrics } from '@/app/_requests/poolCreditMetrics'
import { isFulfilledPromise } from '@/utils'

type RiskReportingProps = {
  poolId: string
}

const RiskReportingTab: React.FC<RiskReportingProps> = async ({ poolId }) => {
  const [poolCreditMetrics, debts, financialReportingDocuments] =
    await Promise.allSettled([
      getPoolCreditMetrics(poolId),
      getBadAndDoubtfulDebts(poolId),
      getFinancialReportingDocuments(poolId),
    ])

  return (
    <Stack spacing={3} mt={3}>
      <PoolData />
      <PortfolioLeadingIndicators />
      {isFulfilledPromise(poolCreditMetrics) && poolCreditMetrics.value && (
        <PoolCreditMetrics poolCreditMetrics={poolCreditMetrics.value} />
      )}
      {isFulfilledPromise(debts) && debts.value && (
        <BadAndDoubtfulDebts badAndDoubltfulDebts={debts.value} />
      )}
      {isFulfilledPromise(financialReportingDocuments) &&
        financialReportingDocuments.value && (
          <FinancialReportingDocuments
            documents={financialReportingDocuments.value}
          />
        )}
    </Stack>
  )
}

export default RiskReportingTab
