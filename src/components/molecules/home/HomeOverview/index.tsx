import { Box } from '@mui/material'
import { LendingTotals } from '@solidant/kasu-sdk/src/services/DataService/types'

import useTranslation from '@/hooks/useTranslation'

import HomeOverviewCard from '@/components/molecules/home/HomeOverview/HomeOverviewCard'

import { formatAmount } from '@/utils'

const HomeOverview: React.FC<{
  lendingTotals: LendingTotals
}> = async ({ lendingTotals }) => {
  const { t } = useTranslation()

  const metrics = [
    {
      titleKey: t('home.summary.metric-1'),
      tooltipKey: t('home.summary.metric-1-tooltip'),
      content: `${formatAmount(lendingTotals?.totalValueLocked || '0', {
        minValue: 1_000_000,
      })}`,
      unit: 'USDC',
    },
    {
      titleKey: t('home.summary.metric-2'),
      tooltipKey: t('home.summary.metric-2-tooltip'),
      content: `${formatAmount(lendingTotals?.loansUnderManagement || '0', {
        minValue: 1_000_000,
      })}`,
      unit: 'USDC',
    },
    {
      titleKey: t('home.summary.metric-3'),
      tooltipKey: t('home.summary.metric-3-tooltip'),
      content: `${formatAmount(lendingTotals?.totalLoanFundsOriginated || '0', {
        minValue: 1_000_000,
      })}`,
      unit: 'USDC',
    },
    {
      titleKey: t('home.summary.metric-4'),
      tooltipKey: t('home.summary.metric-4-tooltip'),
      content: `${formatAmount(lendingTotals?.totalYieldEarned || '0', {
        maxDecimals: 4,
      })}`,
      unit: 'USDC',
    },
    {
      titleKey: t('home.summary.metric-5'),
      tooltipKey: t('home.summary.metric-5-tooltip'),
      content: `${formatAmount(lendingTotals?.totalLossRate * 100 || '0')}`,
      unit: '%',
    },
  ]

  return (
    <Box>
      <Box
        display={{ xs: 'grid' }}
        gridTemplateColumns={{
          xs: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        }}
        gap={{ xs: 2 }}
      >
        {metrics.map((metric, index) => (
          <HomeOverviewCard
            key={index}
            {...metric}
            isLast={index === metrics.length - 1}
          />
        ))}
      </Box>
    </Box>
  )
}

export default HomeOverview
