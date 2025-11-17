'use server'

import {
  GQLGetLockingPeriods,
  LockPeriod,
} from '@kasufinance/kasu-sdk/src/services/Locking/types'

import FALLBACK_LOCK_PERIODS from '@/config/lockPeriod'
import sdkConfig from '@/config/sdk'

const getLockPeriods = async (): Promise<LockPeriod[]> => {
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
}

export default getLockPeriods
