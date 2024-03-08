import { Box, Card, Typography } from '@mui/material'
import { useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricGroup from '@/components/molecules/details/poolDelegateCard/MetricGroup'

import { MetricGroupType, PoolMetricIds } from '@/constants'
import mockResponseWithId, {
  PoolMetric,
} from '@/mock-data/pool-details/mockResponse'

const PoolDelegateCard = () => {
  const { t } = useTranslation()
  const metrics = mockResponseWithId.poolDelegate.data.metrics

  const { firstArray, secondArray, thirdArray } = useMemo(() => {
    const firstArray: PoolMetric[] = metrics.filter((metric) =>
      [
        PoolMetricIds.History,
        PoolMetricIds.TotalFunds,
        PoolMetricIds.Loans,
      ].includes(metric.id as PoolMetricIds)
    )

    const secondArray: PoolMetric[] = metrics.filter((metric) =>
      [PoolMetricIds.AssetClasses, PoolMetricIds.OtherPools].includes(
        metric.id as PoolMetricIds
      )
    )

    const thirdArray: PoolMetric[] = metrics.filter((metric) =>
      [PoolMetricIds.TotalLoans, PoolMetricIds.Loss].includes(
        metric.id as PoolMetricIds
      )
    )

    return { firstArray, secondArray, thirdArray }
  }, [metrics])

  return (
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2 }} elevation={1}>
      <Typography variant='h6' mb={2}>
        {t('details.poolDelegate.title')}
      </Typography>

      <Box display='flex' width='100%' className='light-blue-background'>
        <MetricGroup metrics={firstArray} type={MetricGroupType.First} />
      </Box>

      <Box display='flex' justifyContent='space-between' width='100%' mt={2}>
        <Box display='flex' width='50%'>
          <MetricGroup metrics={secondArray} type={MetricGroupType.Second} />
        </Box>

        <Box display='flex' width='50%'>
          <MetricGroup metrics={thirdArray} type={MetricGroupType.Third} />
        </Box>
      </Box>
    </Card>
  )
}

export default PoolDelegateCard
