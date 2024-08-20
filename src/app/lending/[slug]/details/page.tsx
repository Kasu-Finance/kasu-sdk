import { Suspense } from 'react'

import PoolDetailsTab from '@/components/organisms/lending/DetailsTab'
import DetailTabSkeleton from '@/components/organisms/lending/DetailsTab/DetailTabSkeleton'

type PageProps = {
  params: {
    slug: string
  }
}

const PoolDetailPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<DetailTabSkeleton />}>
      <PoolDetailsTab poolId={params.slug} />
    </Suspense>
  )
}

export default PoolDetailPage
