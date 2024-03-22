import { Box, Typography } from '@mui/material'
import { PoolMetric } from 'kasu-sdk/src/types'
import React, { memo, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { WithdrawMetrics } from '@/constants'

interface MetricsSectionProps {
  poolName: string
  metrics: PoolMetric[]
  metricsRowClassName: string
}

const MetricsSection: React.FC<MetricsSectionProps> = ({
  poolName,
  metrics,
  metricsRowClassName,
}) => {
  const { t } = useTranslation()

  const firstRowMetrics = useMemo(
    () =>
      metrics.filter(
        (metric) => metric.id !== WithdrawMetrics.TRANCHE_INVESTMENT
      ),
    [metrics]
  )
  const secondRowMetrics = useMemo(
    () =>
      metrics.filter(
        (metric) => metric.id === WithdrawMetrics.TRANCHE_INVESTMENT
      ),
    [metrics]
  )

  return (
    <>
      <Box display='flex' className={metricsRowClassName} mt={3}>
        <Box width='50%' pr={1}>
          <InfoColumn
            title={t('lending.withdraw.fromPool')}
            metric={
              <Typography variant='h6' pl={2}>
                {poolName}
              </Typography>
            }
            showDivider={true}
          />
        </Box>
        {firstRowMetrics.map((metric, index) => (
          <MetricWithSuffix
            key={`first-row-${metric.id}-${index}`}
            titleKey={t(`lending.withdraw.metrics.${metric.id}.label`)}
            tooltipKey={t(`lending.withdraw.metrics.${metric.id}.tooltip`)}
            suffix={metric.unit}
            content={String(metric.content)}
            containerSx={{ width: '50%', pb: 1 }}
          />
        ))}
      </Box>

      {secondRowMetrics.length > 0 && (
        <Box display='flex' className={metricsRowClassName}>
          <Box flex={1} /> {/* Empty space for alignment */}
          {secondRowMetrics.map((metric, index) => (
            <MetricWithSuffix
              key={`second-row-${metric.id}-${index}`}
              titleKey={t(`lending.withdraw.metrics.${metric.id}.label`)}
              tooltipKey={t(`lending.withdraw.metrics.${metric.id}.tooltip`)}
              suffix={metric.unit}
              content={String(metric.content)}
              containerSx={{ width: '50%', pb: 1 }}
            />
          ))}
        </Box>
      )}
    </>
  )
}

export default memo(MetricsSection)
