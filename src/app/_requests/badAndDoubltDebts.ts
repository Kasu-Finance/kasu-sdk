import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

export const getBadAndDoubtfulDebts = unstable_cache(
  async (poolId?: string) => {
    const sdk = await getKasuSDK()

    const badAndDoubtfulDebts = await sdk.DataService.getBadAndDoubtfulDebts()

    const result = badAndDoubtfulDebts.find(
      (pool) => pool.poolIdFK.toLowerCase() === poolId?.toLowerCase()
    )

    return result
  },
  ['badAndDoubtfulDebts'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['badAndDoubtfulDebts'],
    revalidate: CACHE_TTL,
  }
)
