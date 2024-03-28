import { PoolOverview } from 'kasu-sdk/src/services/DataService/types'

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

export const mockedPoolOverview: PoolOverview = {
  poolName: 'Green Energy Financing',
  id: 'pool-123',
  poolAddress: '0x1234...abcd',
  apy: 5.6,
  description:
    'A pool dedicated to financing renewable energy projects around the globe.',
  bannerImageUrl: 'https://example.com/images/banner/green-energy.jpg',
  thumbnailImageUrl: 'https://example.com/images/thumbnail/green-energy.jpg',
  strategyDeckUrl: 'https://example.com/decks/green-energy-strategy.pdf',
  tranches: [
    {
      id: 'tranche-1',
      apy: '4.5',
      poolCapacity: '5000000',
      maximumDeposit: '1000000',
      minimumDeposit: '1000',
      name: 'Junior Tranche',
    },
    {
      id: 'tranche-2',
      apy: '6.5',
      poolCapacity: '2000000',
      maximumDeposit: '1000000',
      minimumDeposit: '1000',
      name: 'Senior Tranche',
    },
  ],
  totalValueLocked: '1500000',
  loansUnderManagement: '20',
  yieldEarned: '75000',
  poolCapacity: '7000000',
  activeLoans: '18',
  assetClass: 'Renewable Energy',
  industryExposure: 'Solar, Wind',
  poolApyStructure: 'Fixed',
  poolInvestmentTerm: '1 Year',
  loanStructure: 'Bullet',
}
