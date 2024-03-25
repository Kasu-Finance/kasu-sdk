import { Box, SxProps, Theme, Typography, TypographyProps } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'

interface MetricWithSuffixProps extends Partial<TypographyProps> {
  content: string
  suffix?: string
  titleKey: string
  tooltipKey: string
  containerSx?: SxProps<Theme>
}

const MetricWithSuffix: React.FC<MetricWithSuffixProps> = ({
  content = '',
  suffix = '',
  titleKey,
  tooltipKey,
  containerSx,
  sx,
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
      <Typography variant='h6' {...typographyProps} sx={{ pl: 2, ...sx }}>
        {content}{' '}
        <Typography variant='body1' component='span'>
          {suffix}
        </Typography>
      </Typography>
    </Box>
  )
}

export default MetricWithSuffix
