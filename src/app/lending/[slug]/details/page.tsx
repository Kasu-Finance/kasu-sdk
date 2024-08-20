import { Suspense } from 'react'

import PoolDetailsTab from '@/components/organisms/lending/DetailsTab'

type PageProps = {
  params: {
    slug: string
  }
}

const PoolDetailPage = ({ params }: PageProps) => {
  return (
    <Suspense fallback='detail skeleton'>
      <PoolDetailsTab poolId={params.slug} />
    </Suspense>
  )
}

export default PoolDetailPage
