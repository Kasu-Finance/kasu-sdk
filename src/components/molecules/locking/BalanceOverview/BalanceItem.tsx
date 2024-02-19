import { Box, Divider, Grid, Typography } from '@mui/material'
import React from 'react'

import ToolTip from '@/components/atoms/ToolTip'

type BalanceItemProps = {
  title: string
  toolTipInfo: string
  value: string[]
  subValue?: string[]
}

const BalanceItem: React.FC<BalanceItemProps> = ({
  title,
  toolTipInfo,
  value,
  subValue,
}) => {
  return (
    <Grid item xs={12}>
      <Box
        mt={1}
        p={(theme) => theme.spacing('6px', 2)}
        display='flex'
        alignItems='center'
      >
        <Typography
          variant='subtitle2'
          component='span'
          sx={{ textTransform: 'capitalize' }}
        >
          {title}
        </Typography>
        <ToolTip title={toolTipInfo} />
      </Box>
      <Divider />
      <Box pt='6px'>
        <Typography pl={2} variant='h6' component='span' display='inline-block'>
          {value[0]}
        </Typography>
        <Typography
          p={(theme) => theme.spacing(0, 2, 0, 1)}
          variant='body1'
          component='span'
        >
          {value[1]}
        </Typography>
      </Box>
      {subValue && (
        <Box>
          <Typography
            pl={2}
            variant='body1'
            component='span'
            display='inline-block'
          >
            {subValue[0]}
          </Typography>
          <Typography
            p={(theme) => theme.spacing(0, 2, 0, 1)}
            variant='caption'
            component='span'
          >
            {subValue[1]}
          </Typography>
        </Box>
      )}
    </Grid>
  )
}

export default BalanceItem
