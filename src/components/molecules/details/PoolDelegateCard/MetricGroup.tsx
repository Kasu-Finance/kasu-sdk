import { Box, Typography } from '@mui/material'
import React from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import NextLink from '@/components/atoms/NextLink'

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
    const titleKey = `details.poolDelegate.${metric.id}.label`
    const tooltipKey = `details.poolDelegate.${metric.id}.tooltip`

    const uniqueKey = `${type}-${metric.id}-${index}`

    const metricContent =
      metric.id === PoolDelegateMetricIds.History
        ? formatDuration(Number(metric.content))
        : metric.content || ''

    switch (type) {
      case MetricGroupType.First:
        return (
          <MetricWithSuffix
            key={uniqueKey}
            content={String(metricContent)}
            suffix={metric?.unit || ''}
            titleKey={titleKey}
            tooltipKey={tooltipKey}
            containerSx={{
              width: isMobile ? '100%' : '33%',
              pb: 1,
              pr: 1,
            }}
          />
        )
      case MetricGroupType.Second:
        return (
          <Box key={uniqueKey} width='100%' pr={2}>
            <InfoRow
              title={t(titleKey)}
              toolTipInfo={t(tooltipKey)}
              showDivider={metric.id === PoolDelegateMetricIds.AssetClasses}
              metric={
                Array.isArray(metric.content) ? (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='flex-end'
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
                            align='right'
                          >
                            {typeof item === 'string' ? item : item.name}
                          </NextLink>
                        ))
                      : 'N/A'}
                  </Box>
                ) : (
                  <Typography variant='body1' component='span' maxWidth={300}>
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
            title={t(titleKey)}
            toolTipInfo={t(tooltipKey)}
            showDivider={index !== arrayLength - 1}
            metric={
              <Typography variant='h6'>{String(metric.content)}</Typography>
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
    >
      {metrics.map((metric, index) =>
        renderMetric(metric, index, metrics.length)
      )}
    </Box>
  )
}

export default MetricGroup
