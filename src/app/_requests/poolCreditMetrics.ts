import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

export const getPoolCreditMetrics = unstable_cache(
  async (poolId?: string) => {
    const sdk = await getKasuSDK()

    const poolCreditMetrics = await sdk.DataService.getPoolCreditMetrics()

    const pool = poolCreditMetrics.find(
      (pool) => pool.poolIdFK.toLowerCase() === poolId?.toLowerCase()
    )

    return pool
  },
  ['poolCreditMetrics'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['poolCreditMetrics'],
    revalidate: CACHE_TTL,
  }
)
