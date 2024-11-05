import { Suspense } from 'react'

import RepaymentsTab from '@/components/organisms/lending/RepaymentsTab'
import RepaymentsTabSkeleton from '@/components/organisms/lending/RepaymentsTab/RepaymentsTabSkeleton'

type PageProps = {
  params: Promise<{ slug: string }>
}

const PoolRepaymentsPage = async ({ params }: PageProps) => {
  const { slug } = await params
  return (
    <Suspense fallback={<RepaymentsTabSkeleton />}>
      <RepaymentsTab poolId={slug} />
    </Suspense>
  )
}

export default PoolRepaymentsPage
