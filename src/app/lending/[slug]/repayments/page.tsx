import { Suspense } from 'react'

import RepaymentsTab from '@/components/organisms/lending/RepaymentsTab'
import RepaymentsTabSkeleton from '@/components/organisms/lending/RepaymentsTab/RepaymentsTabSkeleton'

type PageProps = {
  params: {
    slug: string
  }
}

const PoolRepaymentsPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback={<RepaymentsTabSkeleton />}>
      <RepaymentsTab poolId={params.slug} />
    </Suspense>
  )
}

export default PoolRepaymentsPage
