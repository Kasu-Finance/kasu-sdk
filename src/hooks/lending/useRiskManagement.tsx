import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { RiskManagementSection } from '@/components/molecules/details/riskManagementCard'

import { convertToRiskManagement } from '@/utils'

const useRiskManagement = (poolId: string) => {
  const sdk = useKasuSDK()

  const { data, error } = useSWR<RiskManagementSection | null>(
    poolId ? `riskManagement/${poolId}` : null,
    async () => {
      const result = await sdk.DataService.getRiskManagement([poolId])

      if (!result?.length) {
        throw new Error('Received empty data')
      }
      const riskData = result[0]
      return convertToRiskManagement(riskData)
    }
  )

  return {
    data: data || null,
    error,
    isLoading: !data && !error,
  }
}

export default useRiskManagement
