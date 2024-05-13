import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useMemo } from 'react'

import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { convertToPoolTraction } from '@/utils'

interface PoolTractionCardProps {
  data: PoolOverview
  title?: string
}

const PoolTractionCard: React.FC<PoolTractionCardProps> = ({ data, title }) => {
  const { metrics } = useMemo(() => convertToPoolTraction(data), [data])

  return (
    <Card sx={{ borderRadius: 0 }}>
      <CardHeader
        title={title && <Typography variant='h6'>{title}</Typography>}
      />

      <CardContent sx={{ padding: 2 }}>
        <Box display='flex' alignItems='center'>
          {metrics.map(({ id, content, unit = '' }, index) => (
            <Box
              key={id}
              display='flex'
              width='100%'
              flexDirection='column'
              pl={index > 0 ? 1 : 0}
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
