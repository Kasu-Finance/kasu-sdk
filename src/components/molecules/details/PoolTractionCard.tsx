import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { PoolTractionMetricIds } from '@/constants'
import { convertToPoolTraction, formatAmount } from '@/utils'

interface PoolTractionCardProps {
  data: PoolOverview
  title?: string
}

const PoolTractionCard: React.FC<PoolTractionCardProps> = ({ data, title }) => {
  const { t } = useTranslation()

  const { metrics } = useMemo(() => convertToPoolTraction(data), [data])
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  return (
    <Card
      sx={(theme) => ({
        borderRadius: 0,
        [theme.breakpoints.down('sm')]: {
          mt: 2,
        },
      })}
    >
      <CardHeader
        title={
          title && (
            <Typography variant='h6' fontSize={isMobile ? 16 : undefined}>
              {title}
            </Typography>
          )
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
          pr: 1,
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <Box
          display='grid'
          gridTemplateColumns={{
            xs: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          }}
          gap={{
            xs: 1,
            lg: 2,
          }}
        >
          {metrics.map(({ id, content, unit = '' }, index) => {
            const isCapacity = id === PoolTractionMetricIds.Capacity
            return (
              <Box
                key={id}
                display='flex'
                width='100%'
                flexDirection='column'
                pl={index > 0 && !isMobile ? 0.5 : 0}
                order={isMobile && isCapacity ? 5 : undefined}
                gridColumn={isMobile && isCapacity ? '1/3' : undefined}
              >
                <InfoColumn
                  title={t(`details.poolTraction.${id}.label`)}
                  showDivider
                  toolTipInfo={t(`details.poolTraction.${id}.tooltip`)}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                    },
                  })}
                  titleStyle={{ fontSize: { xs: 10, sm: 14 } }}
                  metric={
                    <Box
                      px={{ xs: 0, sm: 2 }}
                      py={{ xs: 0, sm: '6px' }}
                      display='flex'
                      justifyContent='space-between'
                      alignItems='end'
                    >
                      <TokenAmount
                        amount={content.toString()}
                        symbol={unit}
                        usdValue={
                          isCapacity
                            ? formatAmount(data.poolCapacity, {
                                minValue: 1_000_000,
                              })
                            : undefined
                        }
                        {...(isCapacity
                          ? {
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'end',
                              gap: 1,
                            }
                          : undefined)}
                      />
                    </Box>
                  }
                />
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default PoolTractionCard
