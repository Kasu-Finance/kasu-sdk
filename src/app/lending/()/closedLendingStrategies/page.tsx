import { Box } from '@mui/material'
import { Suspense } from 'react'

import getTranslation from '@/hooks/useTranslation'

import EmptyDataPlaceholder from '@/components/atoms/EmptyDataPlaceholder'
import PoolLayoutWrapper from '@/components/organisms/home/PoolLayoutWrapper'
import PoolLayoutWrapperSkeleton from '@/components/organisms/home/PoolLayoutWrapperSkeleton'

import { getPoolDelegate } from '@/app/_requests/poolDelegate'
import { getPoolOverview } from '@/app/_requests/pools'

import { PoolOverviewWithDelegate } from '@/types/page'

const ClosedLendingStrategies = async () => {
  const { t } = getTranslation()

  const [pools, poolDelegates] = await Promise.all([
    getPoolOverview(),
    getPoolDelegate(),
  ])

  const poolsWithDelegate = pools.reduce((acc, cur) => {
    if (!cur.isActive) {
      const delegate = poolDelegates.find((delegate) =>
        delegate.otherKASUPools.find((pool) => pool.id === cur.id)
      )

      if (delegate) {
        acc.push({ ...cur, delegate })
      }
    }

    return acc
  }, [] as PoolOverviewWithDelegate[])

  return (
    <Box mt={3}>
      <Suspense fallback={<PoolLayoutWrapperSkeleton />}>
        <PoolLayoutWrapper
          pools={poolsWithDelegate}
          emptyPoolsPlaceholder={
            <EmptyDataPlaceholder text={t(`home.no-data.closedPools`)} />
          }
        />
      </Suspense>
    </Box>
  )
}

export default ClosedLendingStrategies
