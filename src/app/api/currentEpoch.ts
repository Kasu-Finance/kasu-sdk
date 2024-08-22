import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

export const getCurrentEpoch = unstable_cache(
  async () => {
    const sdk = await getKasuSDK()
    const currentEpoch = await sdk.UserLending.getCurrentEpoch()

    return currentEpoch
  },
  ['currentEpoch'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['currentEpoch'],
    revalidate: CACHE_TTL,
  }
)
