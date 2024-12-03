import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

export const getPoolsTotals = unstable_cache(
  async (poolOverviews: PoolOverview[]) => {
    const sdk = await getKasuSDK()

    return await sdk.DataService.getLendingTotals(poolOverviews)
  },
  ['totals'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['totals'],
    revalidate: CACHE_TTL,
  }
)
