import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

const fetchPoolOverview = unstable_cache(
  async () => {
    const sdk = await getKasuSDK()
    return await sdk.DataService.getPoolOverview()
  },
  ['poolOverview'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['pools'],
    revalidate: CACHE_TTL,
  }
)

const getPoolOverview = unstable_cache(async (poolId?: string) => {
  const pools = await fetchPoolOverview()

  if (!poolId) return pools

  const pool = pools.find((pool) => pool.id === poolId)

  if (!pool) return pools

  return [pool]
})

export default getPoolOverview
