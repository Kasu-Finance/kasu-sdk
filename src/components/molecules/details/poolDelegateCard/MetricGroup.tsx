import { Box, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import NextLink from '@/components/atoms/NextLink'
import MetricTextUnit from '@/components/molecules/details/MetricTextUnit'

import { MetricGroupType, PoolMetricIds } from '@/constants'
import { PoolMetric } from '@/mock-data/pool-details/mockResponse'
import formatDuration from '@/utils/formats/formatDuration'

interface MetricGroupProps {
  metrics: PoolMetric[]
  type: MetricGroupType
}

const MetricGroup: React.FC<MetricGroupProps> = ({ metrics, type }) => {
  const { t } = useTranslation()

  const renderMetric = (
    metric: PoolMetric,
    index: number,
    arrayLength: number
  ) => {
    const titleKey = `details.poolDelegate.${metric.id}.label`
    const tooltipKey = `details.poolDelegate.${metric.id}.tooltip`

    const textDate =
      metric.id === PoolMetricIds.History
        ? formatDuration(Number(metric.content))
        : metric.content

    switch (type) {
      case MetricGroupType.First:
        return (
          <MetricTextUnit
            metric={{ ...metric, content: textDate }}
            titleKey={titleKey}
            tooltipKey={tooltipKey}
            containerSx={{ width: '33%', pb: 1, pr: 1 }}
          />
        )
      case MetricGroupType.Second:
        return (
          <Box width='100%' pr={2}>
            <InfoRow
              key={metric.id}
              title={t(titleKey)}
              toolTipInfo={t(tooltipKey)}
              showDivider={metric.id === PoolMetricIds.AssetClasses}
              metric={
                Array.isArray(metric.content) ? (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='flex-end'
                  >
                    {metric.content.map((item, itemIndex) => (
                      <NextLink
                        key={`${metric.id}_${itemIndex}`}
                        href='#'
                        color='primary'
                        variant='body2'
                      >
                        {item}
                      </NextLink>
                    ))}
                  </Box>
                ) : (
                  <Typography variant='body2' component='span'>
                    {metric.content}
                  </Typography>
                )
              }
            />
          </Box>
        )
      case MetricGroupType.Third:
        return (
          <InfoRow
            key={metric.id}
            title={t(titleKey)}
            toolTipInfo={t(tooltipKey)}
            showDivider={index !== arrayLength - 1}
            metric={<Typography variant='h6'>{metric.content}</Typography>}
          />
        )
      default:
        return null
    }
  }

  return (
    <Box
      display={type === MetricGroupType.First ? 'flex' : 'block'}
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
