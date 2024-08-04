import {
  Box,
  Divider,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material'
import { isValidElement, ReactNode } from 'react'

import ToolTip from '@/components/atoms/ToolTip'

type InfoColumnProps = {
  title: string
  subtitle?: string
  toolTipInfo?: ReactNode
  showDivider?: boolean
  metric: ReactNode
  containerSx?: SxProps<Theme>
  titleContainerSx?: SxProps<Theme>
  titleStyle?: TypographyProps
  subtitleStyle?: TypographyProps
  alignTitleItems?: 'center' | 'flex-start' | 'flex-end' | 'normal'
  dividerStyle?: SxProps<Theme>
}

const InfoColumn: React.FC<InfoColumnProps> = ({
  title,
  subtitle,
  toolTipInfo,
  showDivider = false,
  metric,
  containerSx,
  titleContainerSx,
  titleStyle,
  subtitleStyle,
  alignTitleItems = 'center',
  dividerStyle,
}) => {
  return (
    <Box sx={containerSx}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='normal'
        px={2}
        py='6px'
        width='100%'
        sx={titleContainerSx}
      >
        <Box display='flex' alignItems={alignTitleItems}>
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
          {toolTipInfo ? (
            isValidElement(toolTipInfo) ? (
              toolTipInfo
            ) : (
              <Box pt={alignTitleItems === 'normal' ? '3px' : 'inherit'}>
                <ToolTip title={toolTipInfo} />
              </Box>
            )
          ) : null}
        </Box>
      </Box>
      {showDivider && <Divider sx={dividerStyle} />}
      {metric}
    </Box>
  )
}

export default InfoColumn
