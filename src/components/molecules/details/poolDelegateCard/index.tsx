import { Box, Card, Typography } from '@mui/material'
import { PoolMetric } from 'kasu-sdk/src/types'
import { useCallback, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricGroup from '@/components/molecules/details/poolDelegateCard/MetricGroup'

import { MetricGroupType, PoolDelegateMetricIds } from '@/constants'

interface PoolDelegateCardProps {
  metrics: PoolMetric[]
}

const PoolDelegateCard: React.FC<PoolDelegateCardProps> = ({ metrics }) => {
  const { t } = useTranslation()

  const filterMetrics = useCallback(
    (ids: PoolDelegateMetricIds[]) => {
      return metrics?.filter((metric) =>
        ids.includes(metric.id as PoolDelegateMetricIds)
      )
    },
    [metrics]
  )

  const { firstArray, secondArray, thirdArray } = useMemo(
    () => ({
      firstArray: filterMetrics([
        PoolDelegateMetricIds.History,
        PoolDelegateMetricIds.TotalFunds,
        PoolDelegateMetricIds.Loans,
      ]),
      secondArray: filterMetrics([
        PoolDelegateMetricIds.AssetClasses,
        PoolDelegateMetricIds.OtherPools,
      ]),
      thirdArray: filterMetrics([
        PoolDelegateMetricIds.TotalLoans,
        PoolDelegateMetricIds.Loss,
      ]),
    }),
    [filterMetrics]
  )

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
