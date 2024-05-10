import { Box, SxProps, Theme, TypographyProps } from '@mui/material'
import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import ContentWithSuffix from '@/components/atoms/ContentWithSuffix'
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
  ...typographyProps
}) => {
  const { t } = useTranslation()

  return (
    <Box
      sx={[
        {
          flexDirection: 'column',
          width: '100%',
        },
        ...(Array.isArray(containerSx) ? containerSx : [containerSx]),
      ]}
    >
      <InfoRow title={t(titleKey)} toolTipInfo={t(tooltipKey)} showDivider />
      <ContentWithSuffix
        content={content}
        suffix={suffix}
        {...typographyProps}
      />
    </Box>
  )
}

export default MetricWithSuffix
