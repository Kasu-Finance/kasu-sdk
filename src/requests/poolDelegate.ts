import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

const getPoolDelegate = unstable_cache(
  async () => {
    const sdk = await getKasuSDK()
    return await sdk.DataService.getPoolDelegateProfileAndHistory()
  },
  ['poolDelegateProfileAndHistory'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['poolDelegate'],
    revalidate: CACHE_TTL,
  }
)

export default getPoolDelegate
