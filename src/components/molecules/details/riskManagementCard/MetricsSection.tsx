import { Box, Typography } from '@mui/material'
import { PoolMetric } from 'kasu-sdk/src/types'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

interface MetricsSectionProps {
  metrics: PoolMetric[]
  prefixKey: string
}

const MetricsSection: React.FC<MetricsSectionProps> = ({
  metrics,
  prefixKey,
}) => {
  const { t } = useTranslation()

  return (
    <Box width='100%' display='flex' flexDirection='column' pr={2}>
      {metrics.map(({ content, id }) => (
        <Box key={id} sx={{ mt: 1 }}>
          <InfoRow
            title={t(`${prefixKey}.${id}.label`)}
            toolTipInfo={t(`${prefixKey}.${id}.tooltip`)}
            showDivider
            metric={<></>}
          />
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <Typography key={index} variant='body2' sx={{ pl: 2, mt: 0.5 }}>
                • {item}
              </Typography>
            ))
          ) : (
            <Typography variant='body2' sx={{ pl: 2, mt: 0.5 }}>
              {content}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

export default MetricsSection
