import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { convertToPoolTraction } from '@/utils'

interface PoolTractionCardProps {
  data: PoolOverview
  title?: string
}

const PoolTractionCard: React.FC<PoolTractionCardProps> = ({ data, title }) => {
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
          {metrics.map(({ id, content, unit = '' }, index) => (
            <Box
              key={id}
              display='flex'
              width='100%'
              flexDirection='column'
              pl={index > 0 && !isMobile ? 0.5 : 0}
            >
              <MetricWithSuffix
                content={String(content)}
                suffix={unit}
                containerSx={{ pr: index === metrics.length - 1 ? 0 : 0.5 }}
                sx={{ pb: 1 }}
                titleKey={`details.poolTraction.${id}.label`}
                tooltipKey={`details.poolTraction.${id}.tooltip`}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default PoolTractionCard
