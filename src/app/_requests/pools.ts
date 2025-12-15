import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'

const CACHE_TTL_SECONDS = 60 * 2 // 2 minutes

export const getPoolOverview = unstable_cache(
  async (poolId?: string) => {
    const sdk = await getKasuSDK()

    const currentEpoch = await getCurrentEpoch()
    const id_in = poolId ? [poolId] : undefined
    return await sdk.DataService.getPoolOverview(currentEpoch, id_in)
  },
  ['poolOverview'],
  {
    tags: ['poolOverview'],
    revalidate: CACHE_TTL_SECONDS,
  }
)
