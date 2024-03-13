import { Box, Divider, Typography, TypographyProps } from '@mui/material'
import React, { ReactNode } from 'react'

import ToolTip from '@/components/atoms/ToolTip'

type InfoRowProps = {
  title: string
  subtitle?: string
  toolTipInfo?: string
  showDivider?: boolean
  metric?: ReactNode
  titleStyle?: TypographyProps
  subtitleStyle?: TypographyProps
}

const InfoRow: React.FC<InfoRowProps> = ({
  title,
  subtitle,
  toolTipInfo,
  showDivider = false,
  metric,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <>
      <Box
        display='flex'
        justifyContent='space-between'
        px={2}
        py='6px'
        width='100%'
      >
        <Box display='flex' alignItems='center'>
          <Box>
            <Typography
              variant='subtitle2'
              component='span'
              color='text.primary'
              {...titleStyle}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant='body2'
                component='span'
                color='text.primary'
                ml='4px'
                {...subtitleStyle}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {toolTipInfo && <ToolTip title={toolTipInfo} />}
        </Box>
        {metric && metric}
      </Box>
      {showDivider && <Divider />}
    </>
  )
}

export default InfoRow
