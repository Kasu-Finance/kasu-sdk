import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import Rating from '@/components/atoms/Rating'

import { RiskMetricIds } from '@/constants'

import { PoolMetric } from '@/types/lending'

interface RiskStatusProps {
  metrics: PoolMetric[]
}

const RiskStatus: React.FC<RiskStatusProps> = ({ metrics }) => {
  const { t } = useTranslation()

  const { lossMetrics, scoreMetrics } = useMemo(() => {
    const lossMetrics = metrics.filter(
      (metric) =>
        metric.id === RiskMetricIds.FirstLoss ||
        metric.id === RiskMetricIds.LossRate
    )

    // community rating removed
    const scoreMetrics = metrics.filter(
      (metric) => metric.id === RiskMetricIds.RiskScore
    )

    return { lossMetrics, scoreMetrics }
  }, [metrics])

  return (
    <Box>
      <Typography variant='subtitle1' sx={{ mb: 1 }}>
        {t('details.riskManagement.riskStatus.title')}
      </Typography>

      <Box
        display='flex'
        width='100%'
        className='light-colored-background'
        pb={0.5}
      >
        <Box display='flex' flexDirection='column' pr={2} sx={{ flexGrow: 1 }}>
          {lossMetrics.map((metric) => (
            <MetricWithSuffix
              key={metric.id}
              content={String(metric.content)}
              suffix={metric.unit || ''}
              titleKey={`details.riskManagement.riskStatus.${metric.id}.label`}
              tooltipKey={`details.riskManagement.riskStatus.${metric.id}.tooltip`}
              color='grey.400'
              sx={{ pb: 0.5 }}
            />
          ))}
        </Box>

        <Box display='flex' flexDirection='column' sx={{ flexGrow: 1 }}>
          {scoreMetrics.map((metric) => (
            <Box key={metric.id}>
              <InfoRow
                title={t(
                  `details.riskManagement.riskStatus.${metric.id}.label`
                )}
                toolTipInfo={t(
                  `details.riskManagement.riskStatus.${metric.id}.tooltip`
                )}
                showDivider
              />

              {metric.isRating ? (
                <Rating
                  value={Number(metric.content)}
                  precision={0.5}
                  readOnly
                  sx={{ pl: 2, mt: 0.5 }}
                />
              ) : (
                <Typography variant='h6' sx={{ pl: 2 }}>
                  {String(metric.content)}{' '}
                  <Typography variant='body2' component='span'>
                    {metric.unit}
                  </Typography>
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default RiskStatus
