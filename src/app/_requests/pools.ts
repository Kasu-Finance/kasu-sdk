import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'
import { DEFAULT_CHAIN_ID } from '@/config/chains'
import { GENERAL_DATA_CACHE_TTL } from '@/constants/general'

const CACHE_TTL_SECONDS = GENERAL_DATA_CACHE_TTL / 1000

export const getPoolOverview = async (poolId?: string, chainId?: number) => {
  const effectiveChainId = chainId ?? DEFAULT_CHAIN_ID

  // Use unstable_cache with chain-specific cache key
  const cachedFetch = unstable_cache(
    async () => {
      const sdk = await getKasuSDK(effectiveChainId)
      const currentEpoch = await getCurrentEpoch(effectiveChainId)
      const id_in = poolId ? [poolId] : undefined
      return await sdk.DataService.getPoolOverview(currentEpoch, id_in)
    },
    ['poolOverview', String(effectiveChainId), poolId ?? 'all'],
    {
      tags: ['poolOverview', `poolOverview-${effectiveChainId}`],
      revalidate: CACHE_TTL_SECONDS,
    }
  )

  return cachedFetch()
}
