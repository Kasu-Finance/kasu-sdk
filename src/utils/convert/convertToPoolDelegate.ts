import { PoolDelegateProfileAndHistory } from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolDelegateMetricIds } from '@/constants'
import formatAmount from '@/utils/formats/formatAmount'
import formatPercentage from '@/utils/formats/formatPercentage'

import { PoolMetric } from '@/types/lending'

const convertToPoolDelegate = (
  delegateProfile: PoolDelegateProfileAndHistory,
  poolId: string
): PoolMetric[] => [
  {
    id: PoolDelegateMetricIds.History,
    content: delegateProfile.delegateLendingHistory,
  },
  {
    id: PoolDelegateMetricIds.TotalFunds,
    content: formatAmount(delegateProfile?.totalLoanFundsOriginated || '0', {
      minValue: 1_000_000,
    }),
    unit: 'USDC',
  },
  {
    id: PoolDelegateMetricIds.TotalLoans,
    content: formatAmount(delegateProfile.totalLoansOriginated, {
      minValue: 1_000_000,
    }),
  },
  {
    id: PoolDelegateMetricIds.AssetClasses,
    content: delegateProfile.assetClasses,
  },
  {
    id: PoolDelegateMetricIds.OtherPools,
    content: delegateProfile.otherKASUPools.filter(
      (otherPools) => otherPools.id !== poolId
    ),
  },
  {
    id: PoolDelegateMetricIds.Loans,
    content: formatAmount(delegateProfile?.loansUnderManagement || '0', {
      minValue: 1_000_000,
    }),
    unit: 'USDC',
  },
  {
    id: PoolDelegateMetricIds.Loss,
    content: formatPercentage(delegateProfile.historicLossRate),
  },
]

export default convertToPoolDelegate
