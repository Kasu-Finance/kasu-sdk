import { Pool } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useAllPools = () => {
  const sdk = useKasuSDK()

  const { data, error } = useSWR<Pool[] | null>('allPools', async () => {
    const result: Pool[] = sdk.DataService.getAllPools()

    if (!result?.length) {
      throw new Error('Received empty data')
    }
    return result
  })

  return {
    data: data || null,
    error,
    isLoading: !data && !error,
  }
}

export default useAllPools
