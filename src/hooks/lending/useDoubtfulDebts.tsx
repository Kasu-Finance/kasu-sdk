import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'
import useTranslation from '@/hooks/useTranslation'

import { FIVE_MINUTES } from '@/constants/general'
import { formatAmount, formatPercentage } from '@/utils'

const formatDoubtfulDebts = (
  value: number,
  isDaysValue: boolean,
  isPercentage: boolean,
  daysTranslation?: string
): string => {
  if (isPercentage) {
    return Number(value) && !isDaysValue ? formatPercentage(value) : 'N/A'
  }

  // if not arrears
  if (!isDaysValue) {
    return Number(value)
      ? `${formatAmount(value || '0', { minDecimals: 2, minValue: 1_000_000 })} USDC`
      : 'N/A'
  }

  return Number(value)
    ? `${formatAmount(value, { maxDecimals: 0 })} ${daysTranslation}`
    : 'N/A'
}

const useDoubtfulDebts = (poolId: string) => {
  const sdk = useKasuSDK()

  const { t } = useTranslation()

  const fetchDoubtfulDebts = async () => {
    const data = await sdk.DataService.getBadAndDoubtfulDebts()
    if (!data?.length) throw new Error('No data available for doubtful debts')
    const filteredData = data.filter((item) => item.poolIdFK === poolId)
    if (!filteredData.length)
      throw new Error(`No data available for pool ID: ${poolId}`)

    const daysTranslation = t('time.days')

    const formatData = filteredData.map((data) => {
      const isDaysValue = data.name === 'Arrears'

      return {
        ...data,
        currentStatusPercentage: formatDoubtfulDebts(
          data.currentStatusPercentage,
          isDaysValue,
          true
        ),
        monthlyAveragePercentage: formatDoubtfulDebts(
          data.monthlyAveragePercentage,
          isDaysValue,
          true
        ),
        totalPercentage: formatDoubtfulDebts(
          data.totalPercentage,
          isDaysValue,
          true
        ),
        currentStatusAmount: formatDoubtfulDebts(
          data.currentStatusAmount,
          isDaysValue,
          false,
          daysTranslation
        ),
        monthlyAverageAmount: formatDoubtfulDebts(
          data.monthlyAverageAmount,
          isDaysValue,
          false,
          daysTranslation
        ),
        totalAmount: formatDoubtfulDebts(
          data.totalAmount,
          isDaysValue,
          false,
          daysTranslation
        ),
      }
    })

    return formatData
  }

  const { data, error, mutate } = useSWR(
    `getBadAndDoubtfulDebts/${poolId}`,
    fetchDoubtfulDebts,
    { dedupingInterval: FIVE_MINUTES }
  )

  return {
    data,
    error,
    isLoading: !data && !error,
    mutate,
  }
}

export default useDoubtfulDebts
