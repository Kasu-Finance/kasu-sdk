'use server'

import {
  GQLGetLockingPeriods,
  LockPeriod,
} from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { unstable_cache } from 'next/cache'

import FALLBACK_LOCK_PERIODS from '@/config/lockPeriod'
import sdkConfig from '@/config/sdk'

const CACHE_TTL = 60 * 60 // 1 hour

const getLockPeriods = async (): Promise<LockPeriod[]> => {
  const cacheKey = ['lockPeriods']

  return unstable_cache(
    async () => {
      try {
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

        const data: { data: GQLGetLockingPeriods } = await res.json()

        return data.data.lockPeriods
      } catch (error) {
        return FALLBACK_LOCK_PERIODS
      }
    },
    cacheKey,
    {
      tags: ['lockPeriods'],
      revalidate: CACHE_TTL,
    }
  )()
}

export default getLockPeriods
