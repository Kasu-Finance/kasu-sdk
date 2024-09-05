import { Suspense } from 'react'

import RiskReportingTab from '@/components/organisms/lending/RiskReportingTab'
import RiskReportingTabSkeleton from '@/components/organisms/lending/RiskReportingTab/RiskReportingTabSkeleton'

type PageProps = {
  params: {
    slug: string
  }
}

const PoolRiskReportingPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<RiskReportingTabSkeleton />}>
      <RiskReportingTab poolId={params.slug} />
    </Suspense>
  )
}

export default PoolRiskReportingPage
