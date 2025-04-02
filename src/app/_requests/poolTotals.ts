import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import { getKasuSDK } from '@/actions/getKasuSDK'

// const CACHE_TTL = 1

export const getPoolsTotals = async (poolOverviews: PoolOverview[]) => {
  const sdk = await getKasuSDK()

  return await sdk.DataService.getLendingTotals(poolOverviews)
}
// ['totals'],
// {
//   // use it to revalidate/flush cache with revalidateTag()
//   tags: ['totals'],
//   revalidate: CACHE_TTL,
// }
// )
