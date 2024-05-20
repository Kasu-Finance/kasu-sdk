import { Box, Card, Typography } from '@mui/material'
import { LendingTotals } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { formatAmount, formatPercentage } from '@/utils'

const HomeStatsCard: React.FC<{
  data: LendingTotals
  title?: string
}> = ({ data, title }) => {
  const metrics = useMemo(() => {
    return [
      {
        titleKey: 'details.poolTraction.valueLocked.label',
        tooltipKey: 'details.poolTraction.valueLocked.tooltip',
        content: `${formatAmount(data?.totalValueLocked || '0', { roundingScale: 'auto' })}`,
        unit: 'USDC',
      },
      {
        titleKey: 'details.poolTraction.management.label',
        tooltipKey: 'details.poolTraction.management.tooltip',
        content: `${formatAmount(data?.loansUnderManagement || '0', { roundingScale: 'auto' })}`,
        unit: 'USDC',
      },
      {
        titleKey: 'details.poolDelegate.totalFunds.label',
        tooltipKey: 'details.poolDelegate.totalFunds.tooltip',
        content: `${formatAmount(data?.totalLoanFundsOriginated || '0', { roundingScale: 'auto' })}`,
        unit: 'USDC',
      },
      {
        titleKey: 'details.poolTraction.yield.label',
        tooltipKey: 'details.poolTraction.yield.tooltip',
        content: `${formatPercentage(data?.totalYieldEarned || '0')}`,
      },
      {
        titleKey: 'lending.poolOverview.detailCard.totalLossRate.label',
        tooltipKey: 'lending.poolOverview.detailCard.totalLossRate.tooltip',
        content: `${formatPercentage(data?.totalLossRate || '0')}`,
      },
    ]
  }, [data])

  return (
    <Card sx={{ minWidth: 275, padding: 2 }} elevation={1}>
      {title && (
        <Typography variant='h6' mb={2}>
          {title}
        </Typography>
      )}
      <Box
        display='flex'
        flexWrap='nowrap'
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        {metrics.map(({ titleKey, tooltipKey, content, unit = '' }, index) => (
          <Box
            key={titleKey}
            display='flex'
            flexDirection='column'
            width='100%'
            pl={{ xs: 0, sm: index > 0 ? 1 : 0 }}
          >
            <MetricWithSuffix
              content={content}
              suffix={unit}
              containerSx={{
                pr: index === metrics.length - 1 ? 0 : 0.5,
              }}
              sx={{ pb: 1 }}
              titleKey={titleKey}
              tooltipKey={tooltipKey}
            />
          </Box>
        ))}
      </Box>
    </Card>
  )
}

export default HomeStatsCard
