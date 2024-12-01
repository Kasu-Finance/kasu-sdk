'use server'

import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'

const CACHE_TTL = 60 * 60 // 1 hour

export const getPoolOverview = unstable_cache(
  async (poolId?: string) => {
    const sdk = await getKasuSDK()

    const currentEpoch = await getCurrentEpoch()
    const id_in = poolId ? [poolId] : undefined
    return await sdk.DataService.getPoolOverview(currentEpoch, id_in)
  },
  ['poolOverview'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['pools'],
    revalidate: CACHE_TTL,
  }
)
