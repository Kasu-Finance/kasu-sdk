import { Suspense } from 'react'

import PoolOverviewTab from '@/components/organisms/lending/OverviewTab'
import OverviewTabSkeleton from '@/components/organisms/lending/OverviewTab/OverviewTabSkeleton'

type PageProps = {
  params: Promise<{ slug: string }>
}

const PoolOverviewPage = async ({ params }: PageProps) => {
  const { slug } = await params
  return (
    <Suspense fallback={<OverviewTabSkeleton />}>
      <PoolOverviewTab poolId={slug} />
    </Suspense>
  )
}

export default PoolOverviewPage
