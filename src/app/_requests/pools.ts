import { getKasuSDK } from '@/actions/getKasuSDK'
import { getCurrentEpoch } from '@/app/_requests/currentEpoch'

// const CACHE_TTL = 60 * 60 // 1 hour

export const getPoolOverview = async (poolId?: string) => {
  const sdk = await getKasuSDK()

  const currentEpoch = await getCurrentEpoch()
  const id_in = poolId ? [poolId] : undefined
  return await sdk.DataService.getPoolOverview(currentEpoch, id_in)
}
