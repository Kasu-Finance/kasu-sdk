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

    if (!data?.length) {
      throw new Error('No data available for financial reporting documents')
    }

    return data
  }

  const { data, error, mutate } = useSWR(
    `getFinancialReportingDocuments/${poolId}`,
    fetchFinancialReporting,
    {
      dedupingInterval: FIVE_MINUTES,
    }
  )

  let customError = error
  let filteredData = data
    ? data.filter((item) => item.poolIdFK === poolId)
    : null

  filteredData = filteredData === undefined ? null : filteredData

  if (data && !filteredData) {
    customError = new Error(`No data available for pool ID: ${poolId}`)
    console.error(`No data available for pool ID: ${poolId}`)
  }

  return {
    data: filteredData,
    error: customError,
    isLoading: !filteredData && !customError,
    mutate,
  }
}

export default useFinancialReporting
