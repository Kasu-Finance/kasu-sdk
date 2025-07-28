'use client'

import { Box, SxProps, Theme, Typography, TypographyProps } from '@mui/material'
import { isValidElement, ReactNode } from 'react'

import DottedDivider, {
  DottedDividerProps,
} from '@/components/atoms/DottedDivider'
import ToolTip, { ToolTipProps } from '@/components/atoms/ToolTip'

type InfoRowProps = {
  title: string
  subtitle?: string
  toolTipInfo?: ReactNode | string
  toolTipProps?: Omit<ToolTipProps, 'title'>
  showDivider?: boolean
  metric?: ReactNode | number | string
  titleStyle?: TypographyProps
  subtitleStyle?: TypographyProps
  dividerProps?: DottedDividerProps
  sx?: SxProps<Theme>
}

const InfoRow: React.FC<InfoRowProps> = ({
  title,
  subtitle,
  toolTipInfo,
  showDivider = false,
  toolTipProps,
  metric,
  titleStyle,
  subtitleStyle,
  dividerProps,
  sx,
}) => {
  const defaultSx = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    py: 2,
  }

  const renderToolTip = (info: ReactNode | string) => {
    if (typeof info === 'string') {
      return <ToolTip title={info} {...toolTipProps} />
    }
    if (isValidElement(info)) {
      return info
    }
    return null
  }

  return (
    <>
      <Box sx={[defaultSx, ...(Array.isArray(sx) ? sx : [sx])]}>
        <Box display='flex' alignItems='center'>
          <Box display='flex' alignItems='center'>
            <Typography
              variant='baseMd'
              component='span'
              color='text.primary'
              {...titleStyle}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant='baseMd'
                component='span'
                color='text.primary'
                ml='4px'
                {...subtitleStyle}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {toolTipInfo && renderToolTip(toolTipInfo)}
        </Box>
        {metric && metric}
      </Box>
      {showDivider && <DottedDivider {...dividerProps} />}
    </>
  )
}

export default InfoRow
