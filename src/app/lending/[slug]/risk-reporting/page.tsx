import { Suspense } from 'react'

import RiskReportingTab from '@/components/organisms/lending/RiskReportingTab'

type PageProps = {
  params: {
    slug: string
  }
}

const PoolRiskReportingPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback="risk reporting skeleton">
      <RiskReportingTab poolId={params.slug} />
    </Suspense>
  )
}

export default PoolRiskReportingPage
