import { Suspense } from 'react'

import PoolDetailsTab from '@/components/organisms/lending/DetailsTab'
import DetailTabSkeleton from '@/components/organisms/lending/DetailsTab/DetailTabSkeleton'

type PageProps = {
  params: Promise<{ slug: string }>
}

const PoolDetailPage = async ({ params }: PageProps) => {
  const { slug } = await params
  return (
    <Suspense fallback={<DetailTabSkeleton />}>
      <PoolDetailsTab poolId={slug} />
    </Suspense>
  )
}

export default PoolDetailPage
