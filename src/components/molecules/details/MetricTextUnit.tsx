import { Box, SxProps, Theme, Typography, TypographyProps } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import { PoolMetric } from '@/types/lending'

export interface MetricProps extends Partial<TypographyProps> {
  metric: PoolMetric
  titleKey: string
  tooltipKey: string
  containerSx?: SxProps<Theme>
}

const MetricTextUnit: React.FC<MetricProps> = ({
  metric,
  titleKey,
  tooltipKey,
  containerSx,
  ...typographyProps
}) => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        flexDirection: 'column',
        width: '100%',
        ...containerSx,
      }}
    >
      <InfoRow
        title={t(titleKey)}
        toolTipInfo={t(tooltipKey)}
        showDivider
        metric={<></>}
      />
      <Typography variant='h6' {...typographyProps} sx={{ pl: 2 }}>
        {metric.content}{' '}
        <Typography variant='body1' component='span'>
          {metric.unit}
        </Typography>
      </Typography>
    </Box>
  )
}

export default MetricTextUnit
