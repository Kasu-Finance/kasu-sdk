import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { RiskManagementSection } from '@/components/molecules/details/RiskManagementCard'

import { convertToRiskManagement } from '@/utils'

const useRiskManagement = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchRiskManagement =
    async (): Promise<RiskManagementSection | null> => {
      const result = await sdk.DataService.getRiskManagement([poolId])

      if (!result.length) {
        console.warn('Received empty data for riskManagement')
        return null
      }

      const riskManagementData = convertToRiskManagement(result[0])
      return riskManagementData
    }

  const { data, error } = useSWR<RiskManagementSection | null>(
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
