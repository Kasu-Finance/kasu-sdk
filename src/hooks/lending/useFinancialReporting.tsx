import { FinancialReportingDocumentsDirectus } from 'kasu-sdk/src/services/DataService/directus-types'
import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'

import { FIVE_MINUTES } from '@/constants/general'

const useFinancialReporting = (poolId: string) => {
  const sdk = useKasuSDK()

  const fetchFinancialReporting = async (): Promise<
    FinancialReportingDocumentsDirectus[]
  > => {
    const data = await sdk.DataService.getFinancialReportingDocuments([poolId])

    if (!data?.length) {
      throw new Error('No data available for financial reporting documents')
    }

    return data
  }

  const { data, error } = useSWR(
    `getFinancialReportingDocuments/${poolId}`,
    fetchFinancialReporting,
    {
      dedupingInterval: FIVE_MINUTES,
    }
  )

  return {
    data,
    error,
    isLoading: !data && !error,
  }
}

export default useFinancialReporting
