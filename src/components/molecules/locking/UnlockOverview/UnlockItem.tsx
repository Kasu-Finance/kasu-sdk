import { Box, Divider, Grid, Typography } from '@mui/material'
import React, { isValidElement, ReactNode } from 'react'

import ToolTip from '@/components/atoms/ToolTip'

type UnlockItemProps = {
  title: string
  toolTipInfo?: string
  metric: ReactNode
  disabled?: boolean
}

const UnlockItem: React.FC<UnlockItemProps> = ({
  title,
  toolTipInfo,
  metric,
  disabled = false,
}) => {
  return (
    <Grid item xs={6}>
      <Box
        display='flex'
        alignItems='center'
        p={(theme) => theme.spacing('6px', 2)}
      >
        <Typography
          variant='subtitle2'
          component='span'
          sx={{ textTransform: 'capitalize' }}
        >
          {title}
        </Typography>
        {toolTipInfo && <ToolTip title={toolTipInfo} />}
      </Box>
      <Divider />
      <Box
        color={(theme) => (disabled ? theme.palette.text.disabled : undefined)}
        p={(theme) => theme.spacing('6px', 2)}
      >
        {isValidElement(metric) ? (
          metric
        ) : (
          <Typography variant='h6' component='span'>
            {metric}
          </Typography>
        )}
      </Box>
    </Grid>
  )
}

export default UnlockItem
