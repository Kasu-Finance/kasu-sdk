import { RiskManagement } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { convertToRiskManagement } from '@/utils'

import { RiskManagementSection } from '@/types/poolDetails'

const useRiskManagement = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetcher = async (): Promise<RiskManagementSection | null> => {
    if (!poolId) return null

    try {
      const result = await sdk.DataService.getRiskManagement([poolId])
      if (result?.length) {
        const riskData: RiskManagement = result[0]
        return convertToRiskManagement(riskData)
      } else {
        console.warn('Received unexpected data format or empty result:', result)
        return null
      }
    } catch (error) {
      console.error('Failed to fetch RiskManagement', error)
      return null
    }
  }

  const { data, error, isValidating } = useSWR<RiskManagementSection | null>(
    `riskManagement/${poolId}`,
    fetcher
  )

  return {
    data,
    error,
    isLoading: isValidating,
  }
}

export default useRiskManagement
