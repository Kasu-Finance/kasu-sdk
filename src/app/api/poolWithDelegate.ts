import { unstable_cache } from 'next/cache'

import { getPoolDelegate } from '@/app/api/poolDelegate/route'
import { getPoolOverview } from '@/app/api/pools/route'

import { PoolOverviewWithDelegate } from '@/types/page'

const CACHE_TTL = 60 * 60 // 1 hour

export const getPoolWithDelegate = unstable_cache(
  async (poolId?: string) => {
    const [pools, poolDelegates] = await Promise.all([
      getPoolOverview(),
      getPoolDelegate(),
    ])

    const poolsWithDelegate = pools
      .filter((pool) => {
        if (!poolId) return true

        return pool.id === poolId
      })
      .reduce((acc, cur) => {
        const delegate = poolDelegates.find(
          (delegate) => delegate.poolIdFK === cur.id
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
