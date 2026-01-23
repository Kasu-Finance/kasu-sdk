import { Stack } from '@mui/material'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import BadAndDoubtfulDebts from '@/components/organisms/lending/RiskReportingTab/BadAndDoubtfulDebts'
import RiskReportingTabSkeleton from '@/components/organisms/lending/RiskReportingTab/RiskReportingTabSkeleton'

import { getBadAndDoubtfulDebts } from '@/app/_requests/badAndDoubltDebts'

type RiskReportingProps = {
  poolId: string
}

const RiskReportingTab: React.FC<RiskReportingProps> = async ({ poolId }) => {
  const debts = await getBadAndDoubtfulDebts(poolId)

  if (!debts) return <RiskReportingTabSkeleton />

  return (
    <Stack spacing={3} mt={3}>
      {/* <PoolData /> */}
      {/* <PortfolioLeadingIndicators /> */}
      {/* {isFulfilledPromise(poolCreditMetrics) && poolCreditMetrics.value && (
        <PoolCreditMetrics poolCreditMetrics={poolCreditMetrics.value} />
      )} */}
      <BadAndDoubtfulDebts badAndDoubltfulDebts={debts} />
      <CustomCard sx={{ bgcolor: 'white' }}>
        <CustomInnerCardContent sx={{ py: 6 }}>
          <EmptyDataPlaceholder text='Comprehensive risk reporting dashboards coming soon' />
        </CustomInnerCardContent>
      </CustomCard>
      {/* {isFulfilledPromise(financialReportingDocuments) &&
        financialReportingDocuments.value && (
          <FinancialReportingDocuments
            documents={financialReportingDocuments.value}
          />
        )} */}
    </Stack>
  )
}

export default RiskReportingTab
