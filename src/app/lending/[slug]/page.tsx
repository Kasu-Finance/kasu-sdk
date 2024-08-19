import { Suspense } from 'react'

import PoolOverviewTab from '@/components/organisms/lending/OverviewTab'
import OverviewTabSkeleton from '@/components/organisms/lending/OverviewTab/OverviewTabSkeleton'

type PageProps = {
  params: {
    slug: string
  }
}

const PoolOverviewPage = async ({ params }: PageProps) => {
  return (
    <Suspense fallback={<OverviewTabSkeleton />}>
      <PoolOverviewTab poolId={params.slug} />
    </Suspense>
  )
}

export default PoolOverviewPage
