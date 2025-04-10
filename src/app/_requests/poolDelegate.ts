import { getKasuSDK } from '@/actions/getKasuSDK'

// const CACHE_TTL = 60 * 60 // 1 hour

export const getPoolDelegate = async () => {
  const sdk = await getKasuSDK()

  return await sdk.DataService.getPoolDelegateProfileAndHistory()
}
// ['poolDelegateProfileAndHistory'],
// {
//   // use it to revalidate/flush cache with revalidateTag()
//   tags: ['poolDelegate'],
//   revalidate: CACHE_TTL,
// }
