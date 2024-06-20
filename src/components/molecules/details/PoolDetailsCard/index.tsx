import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useCallback, useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import MetricDisplay from '@/components/molecules/details/PoolDetailsCard/MetricDisplay'

import { MetricGroupType, PoolDetailsMetricIds } from '@/constants'
import { convertToPoolDetails, formatPercentage } from '@/utils'

interface PoolDetailsCardProps {
  data: PoolOverview
}

const PoolDetailsCard: React.FC<PoolDetailsCardProps> = ({ data }) => {
  const { t } = useTranslation()

  const { metrics } = useMemo(() => convertToPoolDetails(data), [data])
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

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
      firstArray: filterMetrics([PoolDetailsMetricIds.AssetClass]),

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
        <ColoredBox>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              {data.tranches.length > 1 &&
                data.tranches.map((tranche) => (
                  <InfoColumn
                    key={tranche.name}
                    title={`${tranche.name} ${t('general.tranche')} ${t('general.apy')}`}
                    showDivider
                    toolTipInfo={t(
                      `lending.tranche.${tranche.name.toLowerCase()}.tooltip`
                    )}
                    metric={
                      <Box pt='6px' pl={2}>
                        {formatPercentage(tranche.apy)}
                      </Box>
                    }
                  />
                ))}

              {data.tranches.length === 1 && (
                <InfoColumn
                  title={t('general.apy')}
                  showDivider
                  toolTipInfo={t('lending.poolOverview.investmentCard.tooltip')}
                  metric={
                    <Box pt='6px' pl={2}>
                      {formatPercentage(data.tranches[0].apy)}
                    </Box>
                  }
                />
              )}
            </Grid>
            <Grid item xs={6}>
              {firstArray.map((metric) => (
                <MetricDisplay
                  metric={metric}
                  key={metric.id}
                  type={MetricGroupType.First}
                  isLastItem={
                    firstArray.indexOf(metric) === firstArray.length - 1
                  }
                />
              ))}
            </Grid>
          </Grid>
        </ColoredBox>
        <Box
          mt={2}
          width='100%'
          display='flex'
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <Box
            display='flex'
            flexDirection='column'
            width={isMobile ? '100%' : '50%'}
          >
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

          <Box
            display='flex'
            flexDirection='column'
            width={isMobile ? '100%' : '50%'}
          >
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
