'use server'

import { getKasuSDK } from '@/actions/getKasuSDK'

// const CACHE_TTL = 1 // 1 hour

export const getPlatformOverview = async () => {
  const sdk = await getKasuSDK()

  return await sdk.DataService.getPlatformOverview()
}
//   ['platformOverview'],
//   {
//     // use it to revalidate/flush cache with revalidateTag()
//     tags: ['platformOverview'],
//     revalidate: CACHE_TTL,
//   }
// )
