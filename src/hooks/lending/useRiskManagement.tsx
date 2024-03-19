import { RiskManagement } from 'kasu-sdk/src/types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useRiskManagement = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchRiskManagement = async (): Promise<RiskManagement[] | null> => {
    const riskManagementData = await sdk.DataService.getRiskManagement([poolId])

    if (!riskManagementData.length) {
      console.warn('Received empty data for riskManagement')
      return null
    }

    return riskManagementData
  }

  const { data, error } = useSWR<RiskManagement[] | null>(
    poolId ? `riskManagement/${poolId}` : null,
    fetchRiskManagement
  )

  return {
    data,
    error,
    isLoading: !data && !error && data !== null,
  }
}

export default useRiskManagement
