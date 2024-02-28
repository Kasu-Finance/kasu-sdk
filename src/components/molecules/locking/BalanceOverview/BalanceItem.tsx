import { Box, Grid, Typography } from '@mui/material'
import React from 'react'

import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

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
      <InfoColumn
        title={title}
        toolTipInfo={toolTipInfo}
        showDivider
        titleStyle={{ textTransform: 'capitalize' }}
        metric={
          <>
            <Box pt='6px' pl={2}>
              <TokenAmount amount={value[0]} symbol={value[1]} />
            </Box>
            {subValue && (
              <Box pl={2}>
                <Typography
                  variant='body1'
                  component='span'
                  display='inline-block'
                >
                  {subValue[0]}
                </Typography>
                <Typography pl={0.5} variant='caption' component='span'>
                  {subValue[1]}
                </Typography>
              </Box>
            )}
          </>
        }
      />
    </Grid>
  )
}

export default BalanceItem
