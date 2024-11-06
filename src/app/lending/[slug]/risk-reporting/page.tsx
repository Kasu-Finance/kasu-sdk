import { Suspense } from 'react'

import RiskReportingTab from '@/components/organisms/lending/RiskReportingTab'
import RiskReportingTabSkeleton from '@/components/organisms/lending/RiskReportingTab/RiskReportingTabSkeleton'

type PageProps = {
  params: Promise<{ slug: string }>
}

const PoolRiskReportingPage = async ({ params }: PageProps) => {
  const { slug } = await params

  return (
    <Suspense fallback={<RiskReportingTabSkeleton />}>
      <RiskReportingTab poolId={slug} />
    </Suspense>
  )
}

export default PoolRiskReportingPage
