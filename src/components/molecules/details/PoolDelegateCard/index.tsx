import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { PoolDelegateProfileAndHistory } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useCallback, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricGroup from '@/components/molecules/details/PoolDelegateCard/MetricGroup'

import { MetricGroupType, PoolDelegateMetricIds } from '@/constants'
import { convertToPoolDelegate } from '@/utils'

interface PoolDelegateCardProps {
  data: PoolDelegateProfileAndHistory
}

const PoolDelegateCard: React.FC<PoolDelegateCardProps> = ({ data }) => {
  const { t } = useTranslation()

  const metrics = useMemo(
    () => (data ? convertToPoolDelegate(data) : []),
    [data]
  )

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
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title={
          <Typography variant='h6'>
            {t('details.poolDelegate.title')}
          </Typography>
        }
      />

      <CardContent sx={{ padding: 2 }}>
        <Box display='flex' width='100%' className='light-colored-background'>
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
      </CardContent>
    </Card>
  )
}

export default PoolDelegateCard
