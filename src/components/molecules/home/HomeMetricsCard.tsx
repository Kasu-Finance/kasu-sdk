import { Box, Card, Typography } from '@mui/material'
import { useMemo } from 'react'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { formatAmount, formatPercentage } from '@/utils'

export interface HomeMetricData {
  totalValueLocked: number
  loansUnderManagement: number
  totalFunds: number
  yieldEarned: number
  totalLossRate: number
}

const HomeMetricsCard: React.FC<{
  data: HomeMetricData
  title?: string
}> = ({ data, title }) => {
  const metrics = useMemo(() => {
    const {
      totalValueLocked,
      loansUnderManagement,
      totalFunds,
      yieldEarned,
      totalLossRate,
    } = data

    return [
      {
        titleKey: 'details.poolTraction.valueLocked.label',
        tooltipKey: 'details.poolTraction.valueLocked.tooltip',
        content: `${formatAmount(totalValueLocked)} M`,
        unit: 'USDC',
      },
      {
        titleKey: 'details.poolTraction.management.label',
        tooltipKey: 'details.poolTraction.management.tooltip',
        content: `${formatAmount(loansUnderManagement)} M`,
        unit: 'USDC',
      },
      {
        titleKey: 'details.poolDelegate.totalFunds.label',
        tooltipKey: 'details.poolDelegate.totalFunds.tooltip',
        content: `${formatAmount(totalFunds)} M`,
        unit: 'USDC',
      },
      {
        titleKey: 'details.poolTraction.yield.label',
        tooltipKey: 'details.poolTraction.yield.tooltip',
        content: `${formatPercentage(yieldEarned)}`,
      },
      {
        titleKey: 'lending.poolOverview.detailCard.totalLossRate.label',
        tooltipKey: 'lending.poolOverview.detailCard.totalLossRate.tooltip',
        content: `${formatPercentage(totalLossRate)}`,
      },
    ]
  }, [data])

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      {title && (
        <Typography variant='h6' mb={2}>
          {title}
        </Typography>
      )}
      <Box display='flex' flexWrap='nowrap'>
        {metrics.map(({ titleKey, tooltipKey, content, unit = '' }, index) => (
          <Box
            key={titleKey}
            display='flex'
            flexDirection='column'
            pl={index > 0 ? 1 : 0}
          >
            <MetricWithSuffix
              content={content}
              suffix={unit}
              containerSx={{ pr: index === metrics.length - 1 ? 0 : 0.5 }}
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

export default HomeMetricsCard
