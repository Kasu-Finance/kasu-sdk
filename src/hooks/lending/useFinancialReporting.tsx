import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'
import { FinancialReportingDocuments } from '@solidant/kasu-sdk/src/services/DataService/types'

const useFinancialReporting = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchFinancialReporting =
    async (): Promise<FinancialReportingDocuments> => {
      const data = await sdk.DataService.getFinancialReportingDocuments()
      if (!data?.length)
        throw new Error('No data available for financial reporting documents')
      const filteredData = data.find((item) => item.poolIdFK === poolId)
      if (!filteredData)
        throw new Error(`No data available for pool ID: ${poolId}`)

      return filteredData
    }

  const { data, error, mutate } = useSWR(
    `getFinancialReportingDocuments/${poolId}`,
    fetchFinancialReporting,
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    data,
    error,
    isLoading: !data && !error,
    mutate,
  }
}

export default useFinancialReporting
