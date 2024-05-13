import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useCallback, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import MetricDisplay from '@/components/molecules/details/PoolDetailsCard/MetricDisplay'

import { MetricGroupType, PoolDetailsMetricIds } from '@/constants'
import { convertToPoolDetails } from '@/utils'

interface PoolDetailsCardProps {
  data: PoolOverview
}

const PoolDetailsCard: React.FC<PoolDetailsCardProps> = ({ data }) => {
  const { t } = useTranslation()
  const { metrics } = useMemo(() => convertToPoolDetails(data), [data])

  const filterMetrics = useCallback(
    (ids: PoolDetailsMetricIds[]) => {
      return metrics.filter((metric) =>
        ids.includes(metric.id as PoolDetailsMetricIds)
      )
    },
    [metrics]
  )

  const { firstArray, secondArray, thirdArray } = useMemo(
    () => ({
      firstArray: filterMetrics([
        PoolDetailsMetricIds.APY,
        PoolDetailsMetricIds.AssetClass,
      ]),

      secondArray: filterMetrics([
        PoolDetailsMetricIds.StructureApy,
        PoolDetailsMetricIds.Term,
      ]),
      thirdArray: filterMetrics([
        PoolDetailsMetricIds.ExposureIndustry,
        PoolDetailsMetricIds.Loan,
      ]),
    }),
    [filterMetrics]
  )

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant='h6'>{t('details.poolDetails.title')}</Typography>
        }
      />

      <CardContent sx={{ padding: 2 }}>
        <Box display='flex' width='100%' className='light-colored-background'>
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
                  thirdArray.indexOf(metric) === secondArray.length - 1
                }
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PoolDetailsCard
