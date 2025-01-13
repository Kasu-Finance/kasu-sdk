import { unstable_cache } from 'next/cache'

import { getPoolDelegate } from '@/app/_requests/poolDelegate'
import { getPoolOverview } from '@/app/_requests/pools'

import { PoolOverviewWithDelegate } from '@/types/page'

const CACHE_TTL = 60 * 60 // 1 hour

export const getPoolWithDelegate = unstable_cache(
  async (
    poolId?: string,
    activePools: boolean = true,
    oversubscribed = false
  ) => {
    const [pools, poolDelegates] = await Promise.all([
      getPoolOverview(),
      getPoolDelegate(),
    ])

    const poolsWithDelegate = pools
      .filter((pool) => {
        if (poolId) {
          return pool.id === poolId
        }

        const showActivePools = activePools ? pool.isActive : !pool.isActive

        const showOversubscribedPools = oversubscribed
          ? pool.isOversubscribed
          : !pool.isOversubscribed

        return showActivePools && showOversubscribedPools
      })
      .reduce((acc, cur) => {
        const delegate = poolDelegates.find((delegate) =>
          delegate.otherKASUPools.find((pool) => pool.id === cur.id)
        )

        if (delegate) {
          acc.push({ ...cur, delegate })
        }

        return acc
      }, [] as PoolOverviewWithDelegate[])

    return poolsWithDelegate
  },
  ['poolsWithDelegate'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['poolsWithDelegate'],
    revalidate: CACHE_TTL,
  }
)
