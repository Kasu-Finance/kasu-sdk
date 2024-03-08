import { Box, SxProps, Theme, Typography } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

import { PoolMetric } from '@/mock-data/pool-details/mockResponse'

export interface MetricProps {
  metric: PoolMetric
  titleKey: string
  tooltipKey: string
  containerSx?: SxProps<Theme>
  typographySx?: SxProps<Theme>
  typographyVariant?:
    | 'body2'
    | 'body1'
    | 'subtitle2'
    | 'subtitle1'
    | 'h6'
    | 'h5'
    | 'h4'
    | 'h3'
    | 'h2'
    | 'h1'
  typographyColor?: string
}

const MetricTextUnit: React.FC<MetricProps> = ({
  metric,
  titleKey,
  tooltipKey,
  containerSx,
  typographySx,
  typographyVariant = 'h6',
  typographyColor = 'text.primary',
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
      <Typography
        variant={typographyVariant}
        color={typographyColor}
        sx={{ pl: 2, ...typographySx }}
      >
        {metric.content}{' '}
        <Typography variant='body1' component='span'>
          {metric.unit}
        </Typography>
      </Typography>
    </Box>
  )
}

export default MetricTextUnit
