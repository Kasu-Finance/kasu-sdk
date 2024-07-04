'use client'

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
        titleKey: 'home.summary.metric-1',
        tooltipKey: 'home.summary.metric-1-tooltip',
        content: `${formatAmount(data?.totalValueLocked || '0', {
          minValue: 1_000_000,
        })}`,
        unit: 'USDC',
      },
      {
        titleKey: 'home.summary.metric-2',
        tooltipKey: 'home.summary.metric-2-tooltip',
        content: `${formatAmount(data?.loansUnderManagement || '0', {
          minValue: 1_000_000,
        })}`,
        unit: 'USDC',
      },
      {
        titleKey: 'home.summary.metric-3',
        tooltipKey: 'home.summary.metric-3-tooltip',
        content: `${formatAmount(data?.totalLoanFundsOriginated || '0', {
          minValue: 1_000_000,
        })}`,
        unit: 'USDC',
      },
      {
        titleKey: 'home.summary.metric-4',
        tooltipKey: 'home.summary.metric-4-tooltip',
        content: `${formatAmount(data?.totalYieldEarned || '0', {
          maxDecimals: 4,
        })}`,
        unit: 'USDC',
      },
      {
        titleKey: 'home.summary.metric-5',
        tooltipKey: 'home.summary.metric-5-tooltip',
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
            width={index === 2 ? '20%' : 'inherit'}
            flexGrow={1}
            pl={{ xs: 0, sm: index > 0 ? 1 : 0 }}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-1px',
            }}
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
