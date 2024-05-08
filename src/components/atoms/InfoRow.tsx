import { Theme } from '@emotion/react'
import {
  Box,
  Divider,
  SxProps,
  Typography,
  TypographyProps,
} from '@mui/material'
import { ReactNode } from 'react'

import ToolTip from '@/components/atoms/ToolTip'

type InfoRowProps = {
  title: string
  subtitle?: string
  toolTipInfo?: string
  showDivider?: boolean
  metric?: ReactNode | number | string
  titleStyle?: TypographyProps
  subtitleStyle?: TypographyProps
  sx?: SxProps<Theme>
}

const InfoRow: React.FC<InfoRowProps> = ({
  title,
  subtitle,
  toolTipInfo,
  showDivider = false,
  metric,
  titleStyle,
  subtitleStyle,
  sx,
}) => {
  const defaultSx = {
    display: 'flex',
    justifyContent: 'space-between',
    px: 2,
    py: '6px',
    width: '100%',
  }

  return (
    <>
      <Box sx={[defaultSx, ...(Array.isArray(sx) ? sx : [sx])]}>
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
