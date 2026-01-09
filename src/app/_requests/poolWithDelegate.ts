import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { getPoolDelegate } from '@/app/_requests/poolDelegate'
import { GENERAL_DATA_CACHE_TTL } from '@/constants/general'

import { PoolOverviewWithDelegate } from '@/types/page'

const CACHE_TTL = GENERAL_DATA_CACHE_TTL / 1000

export const getPoolWithDelegate = async (
  poolId?: string,
  activePools: boolean = true,
  oversubscribed = false
) => {
  const cacheKey = [
    'poolWithDelegate',
    poolId ?? 'all',
    activePools ? 'active' : 'inactive',
    oversubscribed ? 'over' : 'under',
  ]

  return unstable_cache(
    async () => {
      const sdk = await getKasuSDK()
      const currentEpoch = await getCurrentEpoch()

      const [pools, poolDelegates] = await Promise.all([
        sdk.DataService.getPoolOverview(
          currentEpoch,
          poolId ? [poolId] : undefined
        ),
        getPoolDelegate(),
      ])

      return pools
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
    },
    cacheKey,
    {
      tags: ['poolWithDelegate'],
      revalidate: CACHE_TTL,
    }
  )()
}
