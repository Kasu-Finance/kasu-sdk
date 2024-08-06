import { Box } from '@mui/material'
import { Suspense } from 'react'

import PoolCardWrapperSkeleton from '@/components/molecules/loaders/home/PoolCardWrapperSkeleton'
import PoolCardWrapper from '@/components/organisms/home/PoolCardWrapper'

import { getPoolDelegate } from '@/app/api/poolDelegate/route'
import { getPoolOverview } from '@/app/api/pools/route'

import { PoolOverviewWithDelegate } from '@/types/page'

const ClosedLendingStrategies = async () => {
  const [pools, poolDelegates] = await Promise.all([
    getPoolOverview(),
    getPoolDelegate(),
  ])

  const poolsWithDelegate = pools.reduce((acc, cur) => {
    if (cur.isActive) {
      const delegate = poolDelegates.find(
        (delegate) => delegate.poolIdFK === cur.id
      )

      if (delegate) {
        acc.push({ ...cur, delegate, isActive: false })
      }
    }

    return acc
  }, [] as PoolOverviewWithDelegate[])

  return (
    <Box display='flex' flexWrap='wrap' gap={3} mt={3}>
      <Suspense fallback={<PoolCardWrapperSkeleton />}>
        <PoolCardWrapper pools={poolsWithDelegate} />
      </Suspense>
    </Box>
  )
}

export default ClosedLendingStrategies
