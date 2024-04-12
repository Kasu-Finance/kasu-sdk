import { PoolDelegateProfileAndHistory } from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolDelegateMetricIds } from '@/constants'

import { PoolMetric } from '@/types/lending'

const convertToPoolDelegate = (
  delegateProfile: PoolDelegateProfileAndHistory
): PoolMetric[] => [
  {
    id: PoolDelegateMetricIds.History,
    content: delegateProfile.delegateLendingHistory,
  },
  {
    id: PoolDelegateMetricIds.TotalFunds,
    content: `${delegateProfile.totalLoanFundsOriginated} M`,
    unit: 'USDC',
  },
  {
    id: PoolDelegateMetricIds.TotalLoans,
    content: delegateProfile.totalLoansOriginated.toString(),
  },
  {
    id: PoolDelegateMetricIds.AssetClasses,
    content: delegateProfile.assetClasses,
  },
  {
    id: PoolDelegateMetricIds.OtherPools,
    content: delegateProfile.otherKASUPools,
  },
  {
    id: PoolDelegateMetricIds.Loans,
    content: `${delegateProfile.loansUnderManagement} M`,
    unit: 'USDC',
  },
  {
    id: PoolDelegateMetricIds.Loss,
    content: `${delegateProfile.historicLossRate} %`,
  },
]

export default convertToPoolDelegate
