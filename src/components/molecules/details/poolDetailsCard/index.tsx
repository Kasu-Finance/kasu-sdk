import { Box, Card, Typography } from '@mui/material'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricDisplay from '@/components/molecules/details/poolDetailsCard/MetricDisplay'

import { MetricGroupType, PoolMetricIds } from '@/constants'
import mockResponseWithId, {
  PoolMetric,
} from '@/mock-data/pool-details/mockResponse'

const PoolDetailsCard = () => {
  const { t } = useTranslation()
  const metrics = mockResponseWithId.poolDetails.data.metrics

  const { firstArray, secondArray, thirdArray } = useMemo(() => {
    const firstArray: PoolMetric[] = metrics.filter((metric) =>
      [PoolMetricIds.APY, PoolMetricIds.AssetClass].includes(
        metric.id as PoolMetricIds
      )
    )

    const secondArray: PoolMetric[] = metrics.filter((metric) =>
      [PoolMetricIds.ExposureIndustry, PoolMetricIds.StructureApy].includes(
        metric.id as PoolMetricIds
      )
    )

    const thirdArray: PoolMetric[] = metrics.filter((metric) =>
      [PoolMetricIds.Term, PoolMetricIds.Loan].includes(
        metric.id as PoolMetricIds
      )
    )

    return { firstArray, secondArray, thirdArray }
  }, [metrics])

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      <Typography variant='h6' mb={2}>
        {t('details.poolDetails.title')}
      </Typography>

      <Box display='flex' width='100%' className='light-blue-background'>
        {firstArray.map((metric) => (
          <MetricDisplay
            metric={metric}
            key={metric.id}
            type={MetricGroupType.First}
            isLastItem={firstArray.indexOf(metric) === firstArray.length - 1}
          />
        ))}
      </Box>

      <Box display='flex' mt={2} width='100%'>
        <Box display='flex' flexDirection='column' width='50%'>
          {secondArray.map((metric) => (
            <MetricDisplay
              metric={metric}
              key={metric.id}
              type={MetricGroupType.Second}
              isLastItem={
                secondArray.indexOf(metric) === secondArray.length - 1
              }
            />
          ))}
        </Box>

        <Box display='flex' flexDirection='column' width='50%'>
          {thirdArray.map((metric) => (
            <MetricDisplay
              metric={metric}
              key={metric.id}
              type={MetricGroupType.Second}
              isLastItem={
                secondArray.indexOf(metric) === secondArray.length - 1
              }
            />
          ))}
        </Box>
      </Box>
    </Card>
  )
}

export default PoolDetailsCard
