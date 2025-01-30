'use server'

import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

export const getPlatformOverview = unstable_cache(
  async () => {
    const sdk = await getKasuSDK()

    return await sdk.DataService.getPlatformOverview()
  },
  ['platformOverview'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['platformOverview'],
    revalidate: CACHE_TTL,
  }
)
