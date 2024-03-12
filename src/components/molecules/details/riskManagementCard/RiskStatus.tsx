import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import Rating from '@/components/atoms/Rating'

import { RiskMetricIds } from '@/constants'

import { PoolMetric } from '@/types/poolDetails'

interface RiskStatusProps {
  metrics: PoolMetric[]
}

const RiskStatus: React.FC<RiskStatusProps> = ({ metrics }) => {
  const { t } = useTranslation()

  const { firstArray, secondArray } = useMemo(() => {
    const firstArray: PoolMetric[] = metrics.filter((metric) =>
      [RiskMetricIds.FirstLoss, RiskMetricIds.LossRate].includes(
        metric.id as RiskMetricIds
      )
    )

    const secondArray: PoolMetric[] = metrics.filter((metric) =>
      [RiskMetricIds.RiskScore, RiskMetricIds.KasuRating].includes(
        metric.id as RiskMetricIds
      )
    )

    return { firstArray, secondArray }
  }, [metrics])

  const renderMetricWithSuffix = (metric: PoolMetric) => (
    <MetricWithSuffix
      key={metric.id}
      content={String(metric.content)}
      suffix={metric.unit || ''}
      titleKey={`details.riskManagement.riskStatus.${metric.id}.label`}
      tooltipKey={`details.riskManagement.riskStatus.${metric.id}.tooltip`}
      color='grey.400'
      sx={{ pb: 0.5 }}
    />
  )

  const renderInfoRow = (metric: PoolMetric) => {
    const title = t(`details.riskManagement.riskStatus.${metric.id}.label`)
    const tooltip = t(`details.riskManagement.riskStatus.${metric.id}.tooltip`)

    return (
      <Box key={metric.id}>
        <InfoRow
          title={title}
          toolTipInfo={tooltip}
          metric={<></>}
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
            {metric.content}{' '}
            <Typography variant='body2' component='span'>
              {metric.unit}
            </Typography>
          </Typography>
        )}
      </Box>
    )
  }

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
          {firstArray.map(renderMetricWithSuffix)}
        </Box>

        <Box width='50%' display='flex' flexDirection='column'>
          {secondArray.map(renderInfoRow)}
        </Box>
      </Box>
    </Box>
  )
}

export default RiskStatus
