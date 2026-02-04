import { unstable_cache } from 'next/cache'

import { getKasuSDK } from '@/actions/getKasuSDK'
import { DEFAULT_CHAIN_ID } from '@/config/chains'
import { GENERAL_DATA_CACHE_TTL } from '@/constants/general'

const CACHE_TTL = GENERAL_DATA_CACHE_TTL / 1000

export const getCurrentEpoch = async (chainId?: number) => {
  const effectiveChainId = chainId ?? DEFAULT_CHAIN_ID

  const cachedFetch = unstable_cache(
    async () => {
      const sdk = await getKasuSDK(effectiveChainId)
      const currentEpoch = await sdk.UserLending.getCurrentEpoch()
      return currentEpoch
    },
    ['currentEpoch', String(effectiveChainId)],
    {
      tags: ['currentEpoch', `currentEpoch-${effectiveChainId}`],
      revalidate: CACHE_TTL,
    }
  )

  return cachedFetch()
}
