// metrics.ts

import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'

import { PoolDelegateMetricIds } from '@/constants'
import { formatAmount } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

export const getPoolCardMetrics = (
  poolDelegate: PoolDelegateProfileAndHistory,
  pool: PoolOverview
) => {
  return [
    {
      id: PoolDelegateMetricIds.TotalFunds,
      title: 'details.poolDelegate.totalFunds',
      value: formatAmount(poolDelegate?.totalLoanFundsOriginated || '0', {
        minValue: 1_000_000,
      }),
      suffix: ' USDC',
      sx: {
        mt: 2,
        pb: 0,
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
      },
      showDivider: true,
    },
    {
      id: PoolDelegateMetricIds.TotalLossRate,
      title: 'lending.poolOverview.detailCard.totalLossRate-label',
      value: `${formatAmount(+poolDelegate.historicLossRate || '0')}  %`,
      suffix: '',
      showDivider: false,
      sx: {
        pt: 0,
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
      },
    },
    {
      id: PoolDelegateMetricIds.AssetClasses,
      title: 'details.poolDetails.assetClass',
      value: pool?.assetClass || 'N/A',
      suffix: '',
      sx: {
        mt: 1,
      },
      showDivider: false,
    },
    {
      id: PoolDelegateMetricIds.Security,
      title: 'lending.poolOverview.detailCard.security',
      value: 'N/A',
      suffix: '',
      isCollapsed: true,
      sx: {
        mt: 1,
        transition: 'max-height 0.3s ease',
        padding: 0,
        overflow: 'hidden',
      },
      showDivider: false,
    },
    {
      id: PoolDelegateMetricIds.LendingHistory,
      title: 'lending.poolOverview.detailCard.lendingHistory',
      value: poolDelegate.delegateLendingHistory
        ? String(
            formatDuration(poolDelegate.delegateLendingHistory, {
              years: true,
              months: true,
            })
          )
        : 'N/A',
      suffix: '',
      isCollapsed: true,
      sx: {
        mt: 1,
        transition: 'max-height 0.3s ease',
        padding: 0,
        overflow: 'hidden',
      },
      showDivider: false,
    },
  ]
}
