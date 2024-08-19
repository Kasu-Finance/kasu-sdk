import { unstable_cache } from 'next/cache'

import getPoolDelegate from '@/requests/poolDelegate'
import getPoolOverview from '@/requests/poolOverview'

import { PoolOverviewWithDelegate } from '@/types/page'

const CACHE_TTL = 60 * 60 // 1 hour

const getPoolWithDelegate = unstable_cache(
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

export default getPoolWithDelegate
