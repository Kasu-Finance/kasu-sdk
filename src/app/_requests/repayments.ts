import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

export const getRepayments = unstable_cache(
  async (poolId: string) => {
    const sdk = await getKasuSDK()
    const repayments = await sdk.DataService.getRepayments()

    const repayment = repayments.find(
      (repayment) => repayment.poolIdFK.toLowerCase() === poolId.toLowerCase()
    )

    return repayment
  },
  ['repayments'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['repayments'],
    revalidate: CACHE_TTL,
  }
)
