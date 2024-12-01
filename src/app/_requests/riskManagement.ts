import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

export const getRiskManagement = unstable_cache(
  async (poolId: string) => {
    const sdk = await getKasuSDK()
    const riskManagement = await sdk.DataService.getRiskManagement()

    const risk = riskManagement.find(
      (risk) => risk.poolIdFK.toLowerCase() === poolId.toLowerCase()
    )

    return risk
  },
  ['riskManagement'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['riskManagement'],
    revalidate: CACHE_TTL,
  }
)
