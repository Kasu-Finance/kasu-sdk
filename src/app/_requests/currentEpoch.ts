import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'
import { GENERAL_DATA_CACHE_TTL } from '@/constants/general'

const CACHE_TTL = GENERAL_DATA_CACHE_TTL / 1000

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
