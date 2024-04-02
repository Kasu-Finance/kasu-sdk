import { WithdrawMetrics } from '@/context/withdrawModal/withdrawModal.types'

import { PoolMetric } from '@/types/lending'

export const metricsMock: PoolMetric[] = [
  {
    id: WithdrawMetrics.TOTAL_INVESTMENT,
    content: '100',
    unit: 'USDT',
  },
  {
    id: WithdrawMetrics.TRANCHE_INVESTMENT,
    content: '100',
    unit: 'USDT',
  },
]
