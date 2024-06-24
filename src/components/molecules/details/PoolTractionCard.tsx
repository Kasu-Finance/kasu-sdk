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
    <Card sx={{ borderRadius: 0 }}>
      <CardHeader
        title={title && <Typography variant='h6'>{title}</Typography>}
      />
      <CardContent sx={{ padding: 2, pr: 1 }}>
        <Box
          display='flex'
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems='center'
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
              >
                <InfoColumn
                  title={t(`details.poolTraction.${id}.label`)}
                  showDivider
                  toolTipInfo={t(`details.poolTraction.${id}.tooltip`)}
                  metric={
                    <Box
                      px={2}
                      py='6px'
                      display='flex'
                      justifyContent='space-between'
                      alignItems='end'
                    >
                      <TokenAmount amount={content.toString()} symbol={unit} />
                      {isCapacity && (
                        <TokenAmount
                          amount={formatAmount(data.poolCapacity, {
                            minValue: 1_000_000,
                          })}
                          symbol='USDC'
                          amountVariant='body1'
                          symbolVariant='caption'
                        />
                      )}
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
