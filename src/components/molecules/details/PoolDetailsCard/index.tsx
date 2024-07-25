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
import InfoRow from '@/components/atoms/InfoRow'
import ToolTip from '@/components/atoms/ToolTip'
import MetricDisplay from '@/components/molecules/details/PoolDetailsCard/MetricDisplay'
import LoanStructure from '@/components/molecules/tooltips/LoanStructure'

import { COLS, MetricGroupType, PoolDetailsMetricIds } from '@/constants'
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

  const { secondArray } = useMemo(
    () => ({
      secondArray: filterMetrics([
        PoolDetailsMetricIds.StructureApy,
        PoolDetailsMetricIds.Term,
      ]),
    }),
    [filterMetrics]
  )

  return (
    <Card
      sx={(theme) => ({
        [theme.breakpoints.down('sm')]: {
          mt: 2,
        },
      })}
    >
      <CardHeader
        title={
          <Typography variant='h6' fontSize={isMobile ? 16 : undefined}>
            {t('details.poolDetails.title')}
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
        <ColoredBox p={{ xs: 1, sm: 0 }}>
          <Grid container spacing={isMobile ? 1 : 2}>
            {data.tranches.map((tranche) => (
              <Grid item xs={COLS / data.tranches.length} key={tranche.name}>
                <InfoColumn
                  title={
                    data.tranches.length > 1
                      ? `${tranche.name} ${t('general.tranche')} ${t('general.apy')}`
                      : t('general.apy')
                  }
                  showDivider
                  toolTipInfo={t(
                    data.tranches.length > 1
                      ? `lending.tranche.${tranche.name.toLowerCase()}.tooltip`
                      : 'lending.poolOverview.investmentCard.tooltip'
                  )}
                  metric={
                    <Box pt='6px' pl={{ xs: 0, sm: 2 }}>
                      {formatPercentage(tranche.apy)}
                    </Box>
                  }
                  titleStyle={{
                    fontSize: { xs: 12, sm: 14 },
                    maxWidth: { xs: 80, sm: 'unset' },
                    display: 'block',
                  }}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                    },
                  })}
                />
              </Grid>
            ))}
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
            <InfoRow
              title={t('details.poolDetails.assetClass.label')}
              toolTipInfo={t('details.poolDetails.assetClass.tooltip')}
              sx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  flexDirection: 'column',
                  px: 0,
                },
              })}
              titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
              metric={
                <Typography
                  variant='body1'
                  component='span'
                  align={isMobile ? 'left' : 'right'}
                  maxWidth={isMobile ? undefined : 300}
                  fontSize={{ xs: 12, sm: 14 }}
                >
                  {data.assetClass}
                </Typography>
              }
            />
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
            <Box width='100%' pr={2}>
              <InfoRow
                showDivider
                title={t('details.poolDetails.exposureIndustry.label')}
                toolTipInfo={t('details.poolDetails.exposureIndustry.tooltip')}
                titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
                sx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    flexDirection: 'column',
                    px: 0,
                  },
                })}
                metric={
                  <Typography
                    variant='body1'
                    align={isMobile ? 'left' : 'right'}
                    fontSize={isMobile ? 12 : 'inherit'}
                  >
                    {data.industryExposure}
                  </Typography>
                }
              />
            </Box>
            <Box width='100%' pr={2}>
              <InfoRow
                title={t('details.poolDetails.loan.label')}
                toolTipInfo={<ToolTip title={<LoanStructure />} />}
                titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
                sx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    flexDirection: 'column',
                    px: 0,
                  },
                })}
                metric={
                  <Typography
                    variant='body1'
                    align={isMobile ? 'left' : 'right'}
                    fontSize={isMobile ? 12 : 'inherit'}
                  >
                    {data.loanStructure}
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PoolDetailsCard
