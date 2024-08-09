// src/app/lending/page.js

import { Box } from '@mui/material'
import { Suspense } from 'react'

import PoolCardWrapperSkeleton from '@/components/molecules/loaders/home/PoolCardWrapperSkeleton'
import EmptyPoolsPlaceholder from '@/components/organisms/home/EmptyPoolsPlaceholder'
import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'

import { getPoolDelegate } from '@/app/api/poolDelegate/route'
import { getPoolOverview } from '@/app/api/pools/route'

import { PoolOverviewWithDelegate } from '@/types/page'

const LendingPage = async () => {
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
        acc.push({ ...cur, delegate })
      }
    }

    return acc
  }, [] as PoolOverviewWithDelegate[])

  return (
    <Box mt={3}>
      <Suspense fallback={<PoolCardWrapperSkeleton />}>
        <PoolLayoutWrapper
          pools={poolsWithDelegate}
          emptyPoolsPlaceholder={<EmptyPoolsPlaceholder isActivePool />}
        />
      </Suspense>
    </Box>
  )
}

export default LendingPage
