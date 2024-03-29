import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

const useRiskManagement = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchRiskManagement = async () => {
    const riskManagementData = await sdk.DataService.getRiskManagement([poolId])

    console.warn('riskManagementData', riskManagementData)

    if (!riskManagementData?.length) {
      throw new Error('No data available for this pool.')
    }

    return riskManagementData
  }

  const { data, error } = useSWR(
    poolId ? `riskManagement/${poolId}` : null,
    fetchRiskManagement
  )

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default useRiskManagement
