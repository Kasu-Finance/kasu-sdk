import { Box, Divider, Grid, Typography } from '@mui/material'
import React from 'react'

import TokenAmount from '@/components/atoms/TokenAmount'
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
      <Box pt='6px' pl={2}>
        <TokenAmount amount={value[0]} symbol={value[1]} />
      </Box>
      {subValue && (
        <Box pl={2}>
          <Typography variant='body1' component='span' display='inline-block'>
            {subValue[0]}
          </Typography>
          <Typography pl={0.5} variant='caption' component='span'>
            {subValue[1]}
          </Typography>
        </Box>
      )}
    </Grid>
  )
}

export default BalanceItem
