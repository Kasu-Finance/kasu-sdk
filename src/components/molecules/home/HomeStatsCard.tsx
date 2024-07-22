'use client'

import { Box, Card, Typography } from '@mui/material'
import { LendingTotals } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'

const HomeStatsCard: React.FC<{
  data: LendingTotals
  title?: string
}> = ({ data, title }) => {
  const { t } = useTranslation()

  const metrics = useMemo(() => {
    return [
      {
        titleKey: t('home.summary.metric-1'),
        tooltipKey: t('home.summary.metric-1-tooltip'),
        content: `${formatAmount(data?.totalValueLocked || '0', {
          minValue: 1_000_000,
        })}`,
        unit: 'USDC',
      },
      {
        titleKey: t('home.summary.metric-2'),
        tooltipKey: t('home.summary.metric-2-tooltip'),
        content: `${formatAmount(data?.loansUnderManagement || '0', {
          minValue: 1_000_000,
        })}`,
        unit: 'USDC',
      },
      {
        titleKey: t('home.summary.metric-3'),
        tooltipKey: t('home.summary.metric-3-tooltip'),
        content: `${formatAmount(data?.totalLoanFundsOriginated || '0', {
          minValue: 1_000_000,
        })}`,
        unit: 'USDC',
      },
      {
        titleKey: t('home.summary.metric-4'),
        tooltipKey: t('home.summary.metric-4-tooltip'),
        content: `${formatAmount(data?.totalYieldEarned || '0', {
          maxDecimals: 4,
        })}`,
        unit: 'USDC',
      },
      {
        titleKey: t('home.summary.metric-5'),
        tooltipKey: t('home.summary.metric-5-tooltip'),
        content: `${formatAmount(data?.totalLossRate * 100 || '0')}`,
        unit: '%',
      },
    ]
  }, [data, t])

  const currentDevice = useDeviceDetection()

  const cardPadding = currentDevice === Device.MOBILE ? 1.5 : 2

  return (
    <Card
      sx={{ minWidth: 275, padding: cardPadding, width: '100%' }}
      elevation={1}
    >
      {title && (
        <Typography variant='h6' mb={2}>
          {title}
        </Typography>
      )}
      <Box
        display={{ xs: 'grid' }}
        gridTemplateColumns={{
          xs: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        }}
        gap={{ xs: 2 }}
      >
        {metrics.map(({ titleKey, tooltipKey, content, unit = '' }, index) => (
          <InfoColumn
            key={index}
            title={titleKey}
            titleStyle={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontSize: { xs: 10, sm: 14 },
            }}
            containerSx={(theme) => ({
              [theme.breakpoints.down('md')]:
                index === metrics.length - 1
                  ? { gridColumn: '1/3' }
                  : undefined,
            })}
            titleContainerSx={(theme) => ({
              [theme.breakpoints.down('md')]: {
                px: 0,
              },
            })}
            toolTipInfo={tooltipKey}
            showDivider
            metric={
              <TokenAmount
                px={{ md: 2 }}
                py='6px'
                amount={content}
                symbol={unit}
              />
            }
          />
        ))}
      </Box>
    </Card>
  )
}

export default HomeStatsCard
