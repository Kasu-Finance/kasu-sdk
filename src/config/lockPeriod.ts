import { LockPeriod } from 'kasu-sdk/src/types'

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

export default FALLBACK_LOCK_PERIODS
