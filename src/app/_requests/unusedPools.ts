import { PoolOverviewDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import { unstable_cache } from 'next/cache'

import sdkConfig from '@/config/sdk'

const CACHE_TTL = 60 * 60 // 1 hour

export const getUnusedPools = unstable_cache(
  async () => {
    const res = await fetch(
      `${sdkConfig.directusUrl}items/PoolOverview?filter[enabled][_neq]=true`,
      {
        next: { revalidate: 60 * 15, tags: ['unusedPools'] },
      }
    )

    if (!res.ok) {
      throw new Error(
        `Failed to fetch unused pools data: ${res.status} ${res.statusText}`
      )
    }

    const unusedPools: { data: PoolOverviewDirectus[] } = await res.json()
    const filteredPools = unusedPools.data.map((pool) => pool.id)

    return filteredPools
  },
  ['unusedPools'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['unusedPools'],
    revalidate: CACHE_TTL,
  }
)
