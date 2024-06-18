import { Box, Grid, Typography } from '@mui/material'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { RiskMetricIds } from '@/constants'

import { PoolMetric } from '@/types/lending'

interface RiskStatusProps {
  metrics: PoolMetric[]
}

const RiskStatus: React.FC<RiskStatusProps> = ({ metrics }) => {
  const { t } = useTranslation()

  const lossMetrics = useMemo(() => {
    const lossMetrics = metrics.filter(
      (metric) =>
        metric.id === RiskMetricIds.FirstLoss ||
        metric.id === RiskMetricIds.LossRate
    )

    return lossMetrics
  }, [metrics])

  return (
    <Box>
      <Typography variant='subtitle1' sx={{ mb: 1 }}>
        {t('details.riskManagement.riskStatus.title')}
      </Typography>
      <ColoredBox>
        <Grid container spacing={2}>
          {lossMetrics.map((metric) => (
            <Grid key={metric.id} item xs={6}>
              <MetricWithSuffix
                content={String(metric.content)}
                suffix={metric.unit || ''}
                titleKey={`details.riskManagement.riskStatus.${metric.id}.label`}
                tooltipKey={`details.riskManagement.riskStatus.${metric.id}.tooltip`}
                color='grey.400'
                sx={{ pb: 0.5 }}
              />
            </Grid>
          ))}
        </Grid>
      </ColoredBox>
    </Box>
  )
}

export default RiskStatus
