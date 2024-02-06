import {
  Box,
  Divider,
  Tooltip,
  Typography,
  TypographyProps,
} from '@mui/material'
import React, { ReactNode } from 'react'

import TooltipTrigger from '@/components/atoms/TooltipTrigger'

import { InfoIcon } from '@/assets/icons'

type InfoRowProps = {
  title: string
  subtitle?: string
  toolTipInfo?: string
  showDivider?: boolean
  metric: ReactNode
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
      <Box display='flex' justifyContent='space-between' px={2} py='6px'>
        <Box display='flex' alignItems='center'>
          <Box>
            <Typography
              variant='subtitle2'
              component='span'
              color='text.primary'
              mr='4px'
              {...titleStyle}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant='body2'
                component='span'
                color='text.primary'
                mr='4px'
                {...subtitleStyle}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {toolTipInfo && (
            <Tooltip
              disableFocusListener
              disableTouchListener
              title={toolTipInfo}
            >
              <TooltipTrigger>
                <InfoIcon />
              </TooltipTrigger>
            </Tooltip>
          )}
        </Box>
        {metric}
      </Box>
      {showDivider && <Divider />}
    </>
  )
}

export default InfoRow
