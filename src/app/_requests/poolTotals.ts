import { getKasuSDK } from '@/actions/getKasuSDK'
import { getPoolOverview } from '@/app/_requests/pools'

// const CACHE_TTL = 1

export const getPoolsTotals = async () => {
  const sdk = await getKasuSDK()

  const pools = await getPoolOverview()

  return await sdk.DataService.getLendingTotals(pools)
}
// ['totals'],
// {
//   // use it to revalidate/flush cache with revalidateTag()
//   tags: ['totals'],
//   revalidate: CACHE_TTL,
// }
// )
