import useSWR from 'swr'

import useKasuSDK from '@/hooks/useKasuSDK'
import useTranslation from '@/hooks/useTranslation'

import { FIVE_MINUTES } from '@/constants/general'
import { formatAmount, formatPercentage } from '@/utils'

type DoubtfulDebtName =
  | 'Arrears'
  | 'Defaults'
  | 'Recovery Action • Unrealised Losses'
  | 'Realised Losses'

type DoubltfulDebtKeys =
  `${DoubtfulDebtName}-${'total' | 'monthly' | 'current'}-${'amount' | 'percentage'}`

const NOT_APPLICABLE_KEYS: DoubltfulDebtKeys[] = [
  'Arrears-total-amount',
  'Arrears-total-percentage',
  'Arrears-monthly-percentage',
  'Arrears-current-percentage',
  'Defaults-total-amount',
  'Defaults-total-percentage',
  'Recovery Action • Unrealised Losses-total-amount',
  'Recovery Action • Unrealised Losses-total-percentage',
]

const formatDoubtfulDebts = (
  value: number,
  unit: string,
  isPercentage: boolean,
  key: DoubltfulDebtKeys
): string => {
  if (NOT_APPLICABLE_KEYS.includes(key)) {
    return 'N/A'
  }

  if (isPercentage) {
    return Number(value) ? formatPercentage(value) : '-'
  }

  const isArrears = key.includes('Arrears' as DoubtfulDebtName)

  return Number(value)
    ? `${formatAmount(
        value,
        isArrears ? { maxDecimals: 0 } : { minDecimals: 2, minValue: 1_000_000 }
      )}  ${unit}`
    : '-'
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
      const dataName = data.name as DoubtfulDebtName

      const unit = dataName === 'Arrears' ? daysTranslation : 'USDC'

      return {
        ...data,
        currentStatusPercentage: formatDoubtfulDebts(
          data.currentStatusPercentage,
          '%',
          true,
          `${dataName}-current-percentage`
        ),
        monthlyAveragePercentage: formatDoubtfulDebts(
          data.monthlyAveragePercentage,
          '%',
          true,
          `${dataName}-monthly-percentage`
        ),
        totalPercentage: formatDoubtfulDebts(
          data.totalPercentage,
          '%',
          true,
          `${dataName}-total-percentage`
        ),
        currentStatusAmount: formatDoubtfulDebts(
          data.currentStatusAmount,
          unit,
          false,
          `${dataName}-current-amount`
        ),
        monthlyAverageAmount: formatDoubtfulDebts(
          data.monthlyAverageAmount,
          unit,
          false,
          `${dataName}-monthly-amount`
        ),
        totalAmount: formatDoubtfulDebts(
          data.totalAmount,
          unit,
          false,
          `${dataName}-total-amount`
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
