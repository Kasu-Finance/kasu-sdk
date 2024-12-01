import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'

const CACHE_TTL = 60 * 60 // 1 hour

export const getFinancialReportingDocuments = unstable_cache(
  async (poolId?: string) => {
    const sdk = await getKasuSDK()

    const financialReportingDocuments =
      await sdk.DataService.getFinancialReportingDocuments()

    const result = financialReportingDocuments.find(
      (pool) => pool.poolIdFK.toLowerCase() === poolId?.toLowerCase()
    )

    return result
  },
  ['financialReportingDocuments'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['financialReportingDocuments'],
    revalidate: CACHE_TTL,
  }
)
