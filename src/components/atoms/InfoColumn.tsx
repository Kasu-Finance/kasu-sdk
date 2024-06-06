import {
  Box,
  Divider,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material'
import { ReactNode } from 'react'

import ToolTip from '@/components/atoms/ToolTip'

type InfoColumnProps = {
  title: string
  subtitle?: string
  toolTipInfo?: string
  showDivider?: boolean
  metric: ReactNode
  containerSx?: SxProps<Theme>
  titleStyle?: TypographyProps
  subtitleStyle?: TypographyProps
  alignTitleItems?: 'center' | 'flex-start' | 'flex-end' | 'normal'
}

const InfoColumn: React.FC<InfoColumnProps> = ({
  title,
  subtitle,
  toolTipInfo,
  showDivider = false,
  metric,
  containerSx,
  titleStyle,
  subtitleStyle,
  alignTitleItems = 'center',
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
          {toolTipInfo && (
            <Box pt={alignTitleItems === 'normal' ? '3px' : 'inherit'}>
              <ToolTip title={toolTipInfo} />
            </Box>
          )}
        </Box>
      </Box>
      {showDivider && <Divider />}
      {metric}
    </Box>
  )
}

export default InfoColumn
