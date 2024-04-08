import { FinancialReportingDocumentsDirectus } from 'kasu-sdk/src/services/DataService/directus-types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const useFinancialReporting = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchFinancialReporting = async (): Promise<
    FinancialReportingDocumentsDirectus[]
  > => {
    const data = await sdk.DataService.getFinancialReportingDocuments()
    if (!data?.length)
      throw new Error('No data available for financial reporting documents')
    const filteredData = data.filter((item) => item.poolIdFK === poolId)
    if (!filteredData.length)
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
