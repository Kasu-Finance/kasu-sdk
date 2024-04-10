import { Box } from '@mui/material'
import { FC } from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { PoolMetric } from '@/types/lending'

interface CommonMetricsProps {
  metrics: PoolMetric[]
  className?: string
}

const CommonMetrics: FC<CommonMetricsProps> = ({ metrics, className }) => {
  const { t } = useTranslation()

  return (
    <Box display='flex' className={className} pt={1}>
      {metrics.map((metric) => (
        <MetricWithSuffix
          key={metric.id}
          titleKey={t(`lending.withdraw.metrics.${metric.id}.label`)}
          tooltipKey={t(`lending.withdraw.metrics.${metric.id}.tooltip`)}
          content={String(metric.content)}
          suffix={metric.unit}
          containerSx={{ width: '50%', pb: 1 }}
          sx={{ mt: 0.5 }}
        />
      ))}
    </Box>
  )
}

export default CommonMetrics
