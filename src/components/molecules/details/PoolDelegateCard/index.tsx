import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { PoolDelegateProfileAndHistory } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useCallback, useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import MetricGroup from '@/components/molecules/details/PoolDelegateCard/MetricGroup'

import { MetricGroupType, PoolDelegateMetricIds } from '@/constants'
import { convertToPoolDelegate } from '@/utils'

interface PoolDelegateCardProps {
  data: PoolDelegateProfileAndHistory
  poolId: string
}

const PoolDelegateCard: React.FC<PoolDelegateCardProps> = ({
  data,
  poolId,
}) => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const metrics = useMemo(
    () => (data ? convertToPoolDelegate(data, poolId) : []),
    [data, poolId]
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
          <Typography variant='h6' fontSize={isMobile ? 16 : undefined}>
            {t('details.poolDelegate.title')}
          </Typography>
        }
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
      />

      <CardContent
        sx={(theme) => ({
          padding: 2,
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <ColoredBox
          sx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              p: 1,
            },
          })}
        >
          <MetricGroup metrics={firstArray} type={MetricGroupType.First} />
        </ColoredBox>

        <Box
          display='flex'
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent='space-between'
          width='100%'
          mt={2}
          p={{ xs: 1, sm: 0 }}
        >
          <Box display='flex' width={isMobile ? '100%' : '50%'}>
            <MetricGroup metrics={secondArray} type={MetricGroupType.Second} />
          </Box>

          <Box
            display='flex'
            width={isMobile ? '100%' : '50%'}
            mt={{ xs: 1, sm: 0 }}
          >
            <MetricGroup metrics={thirdArray} type={MetricGroupType.Third} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PoolDelegateCard
