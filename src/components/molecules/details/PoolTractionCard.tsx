import { Box, Card, Typography } from '@mui/material'
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
    <Card sx={{ minWidth: 275, boxShadow: 3, padding: 2, mt: 3 }} elevation={1}>
      {title && (
        <Typography variant='h6' mb={2}>
          {title}
        </Typography>
      )}

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
    </Card>
  )
}

export default PoolTractionCard
