import { Box, Typography } from '@mui/material'
import React from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'
import NextLink from '@/components/atoms/NextLink'
import TokenAmount from '@/components/atoms/TokenAmount'

import { MetricGroupType, PoolDelegateMetricIds } from '@/constants'
import formatDuration from '@/utils/formats/formatDuration'

import { PoolMetric } from '@/types/lending'

interface MetricGroupProps {
  metrics: PoolMetric[]
  type: MetricGroupType
}

const MetricGroup: React.FC<MetricGroupProps> = ({ metrics, type }) => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const renderMetric = (
    metric: PoolMetric,
    index: number,
    arrayLength: number
  ) => {
    const titleKey = t(`details.poolDelegate.${metric.id}.label`)
    const tooltipKey = t(`details.poolDelegate.${metric.id}.tooltip`)

    const uniqueKey = `${type}-${metric.id}-${index}`

    const metricContent =
      metric.id === PoolDelegateMetricIds.History
        ? formatDuration(String(metric.content), {
            years: true,
            months: true,
            days: true,
          })
        : metric.content || ''

    switch (type) {
      case MetricGroupType.First:
        return (
          <InfoColumn
            key={uniqueKey}
            title={titleKey}
            toolTipInfo={tooltipKey}
            showDivider
            containerSx={{
              width: '100%',
            }}
            titleContainerSx={(theme) => ({
              [theme.breakpoints.down('sm')]: {
                px: 0,
              },
            })}
            titleStyle={{
              fontSize: { xs: 12, sm: 14 },
            }}
            metric={
              <TokenAmount
                px={{ sx: 0, sm: 2 }}
                py={{ sx: 0, sm: '6px' }}
                amount={metricContent.toString()}
                symbol={metric?.unit || ''}
              />
            }
          />
        )
      case MetricGroupType.Second:
        return (
          <Box key={uniqueKey} width='100%' pr={2}>
            <InfoRow
              title={titleKey}
              toolTipInfo={t(tooltipKey)}
              showDivider={
                !isMobile && metric.id === PoolDelegateMetricIds.AssetClasses
              }
              sx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  flexDirection: 'column',
                  px: 0,
                },
              })}
              titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
              metric={
                Array.isArray(metric.content) ? (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems={isMobile ? 'flex-start' : 'flex-end'}
                  >
                    {metric.content.length
                      ? metric.content.map((item, itemIndex) => (
                          <NextLink
                            key={`${metric.id}_${itemIndex}`}
                            href={
                              typeof item === 'string'
                                ? '#'
                                : `/lending/${item.id}`
                            }
                            color='primary.contrastText'
                            variant='body1'
                            fontSize={isMobile ? 10 : 'inherit'}
                            align={isMobile ? 'left' : 'right'}
                          >
                            {typeof item === 'string' ? item : item.name}
                          </NextLink>
                        ))
                      : 'N/A'}
                  </Box>
                ) : (
                  <Typography
                    variant='body1'
                    align={isMobile ? 'left' : 'right'}
                    component='span'
                    maxWidth={300}
                    fontSize={{ xs: 12, sm: 14 }}
                    fontWeight={{ xs: 400, sm: 500 }}
                  >
                    {metric.content || 'N/A'}
                  </Typography>
                )
              }
            />
          </Box>
        )
      case MetricGroupType.Third:
        return (
          <InfoRow
            key={uniqueKey}
            title={titleKey}
            toolTipInfo={t(tooltipKey)}
            showDivider={!isMobile && index !== arrayLength - 1}
            sx={(theme) => ({
              [theme.breakpoints.down('sm')]: {
                px: 0,
              },
            })}
            titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
            metric={
              <Typography
                textAlign='right'
                variant='h6'
                fontSize={{ xs: 14, sm: 20 }}
              >
                {metric.content.toString()}
              </Typography>
            }
          />
        )
      default:
        return null
    }
  }

  return (
    <Box
      display={type === MetricGroupType.First ? 'flex' : 'block'}
      flexDirection={isMobile ? 'column' : 'row'}
      justifyContent='space-between'
      width='100%'
      gap={type === MetricGroupType.First ? 2 : 0}
    >
      {metrics.map((metric, index) =>
        renderMetric(metric, index, metrics.length)
      )}
    </Box>
  )
}

export default MetricGroup
