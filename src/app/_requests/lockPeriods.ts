import { GQLGetLockingPeriods } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { unstable_cache } from 'next/cache'

import sdkConfig from '@/config/sdk'

const CACHE_TTL = 60 * 60 // 1 hour

export const getLockPeriods = unstable_cache(
  async () => {
    const res = await fetch(sdkConfig.subgraphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{
                  lockPeriods(orderBy: lockPeriod, where: { isActive: true }) {
                      rKSUMultiplier
                      lockPeriod
                      ksuBonusMultiplier
                      id
                  }
              }`,
      }),
    })

    if (!res.ok) {
      throw new Error(
        `Failed to fetch lock periods data: ${res.status} ${res.statusText}`
      )
    }

    const data: { data: GQLGetLockingPeriods } = await res.json()

    return data.data.lockPeriods
  },
  ['lockPeriods'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['lockPeriods'],
    revalidate: CACHE_TTL,
  }
)
