import { Box, Typography } from '@mui/material'
import React from 'react'

import useTranslation, { TranslationKeys } from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import Rating from '@/components/atoms/Rating'
import MetricTextUnit from '@/components/molecules/details/MetricTextUnit'

import { PoolMetricIds } from '@/constants'
import { PoolMetric } from '@/mock-data/pool-details/mockResponse'

interface RiskStatusProps {
  metrics: PoolMetric[]
}

const RiskStatus: React.FC<RiskStatusProps> = ({ metrics }) => {
  const { t } = useTranslation()

  const firstArray = metrics.filter(
    (metric) =>
      metric.id === PoolMetricIds.FirstLoss ||
      metric.id === PoolMetricIds.LossRate
  )

  const secondArray = metrics.filter(
    (metric) =>
      metric.id === PoolMetricIds.RiskScore ||
      metric.id === PoolMetricIds.KasuRating
  )

  return (
    <Box>
      <Typography variant='subtitle1' sx={{ mb: 1 }}>
        {t('details.riskManagement.riskStatus.title')}
      </Typography>

      <Box
        display='flex'
        width='100%'
        className='light-blue-background'
        pb={0.5}
      >
        <Box width='50%' display='flex' flexDirection='column' pr={2}>
          {firstArray.map((metric) => {
            const titleKey =
              `details.riskManagement.riskStatus.${metric.id}.label` as TranslationKeys

            const tooltipKey =
              `details.riskManagement.riskStatus.${metric.id}.tooltip` as TranslationKeys

            return (
              <MetricTextUnit
                key={metric.id}
                metric={metric}
                titleKey={titleKey}
                tooltipKey={tooltipKey}
                typographyColor='grey.400'
                typographySx={{ pb: 0.5 }}
              />
            )
          })}
        </Box>

        <Box width='50%' display='flex' flexDirection='column'>
          {secondArray.map((metric, index) => {
            const { value, unit, isRating } = metric
            const titleKey = t(
              `details.riskManagement.riskStatus.${metric.id}.label` as TranslationKeys
            )
            const tooltipKey = t(
              `details.riskManagement.riskStatus.${metric.id}.tooltip` as TranslationKeys
            )

            return (
              <Box key={index}>
                <InfoRow
                  title={titleKey}
                  toolTipInfo={tooltipKey}
                  metric={<></>}
                  showDivider
                />
                {isRating ? (
                  <Rating
                    value={Number(value)}
                    precision={0.5}
                    readOnly
                    sx={{ pl: 2, mt: 0.5 }}
                  />
                ) : (
                  <Typography variant='h6' sx={{ pl: 2, mt: 0.5 }}>
                    {value}{' '}
                    <Typography variant='body2' component='span'>
                      {unit}
                    </Typography>
                  </Typography>
                )}
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default RiskStatus
