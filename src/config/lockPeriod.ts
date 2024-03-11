import { GQLGetLockingPeriods, LockPeriod } from 'kasu-sdk/src/types'

import sdkConfig from '@/config/sdk'

const FALLBACK_LOCK_PERIODS: LockPeriod[] = [
  {
    id: '180',
    lockPeriod: '180',
    ksuBonusMultiplier: '0.1',
    rKSUMultiplier: '0.25',
  },
  {
    id: '30',
    lockPeriod: '30',
    ksuBonusMultiplier: '0',
    rKSUMultiplier: '0.05',
  },
  {
    id: '360',
    lockPeriod: '360',
    ksuBonusMultiplier: '0.25',
    rKSUMultiplier: '0.5',
  },
  {
    id: '720',
    lockPeriod: '720',
    ksuBonusMultiplier: '0.7',
    rKSUMultiplier: '1',
  },
]

export const getLockPeriods = async (): Promise<LockPeriod[]> => {
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
