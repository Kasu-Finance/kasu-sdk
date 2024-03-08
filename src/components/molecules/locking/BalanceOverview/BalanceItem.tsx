import { Grid } from '@mui/material'
import React from 'react'

import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

type BalanceItemProps = {
  title: string
  toolTipInfo: string
  value: string[]
  usdValue?: string
}

const BalanceItem: React.FC<BalanceItemProps> = ({
  title,
  toolTipInfo,
  value,
  usdValue,
}) => {
  return (
    <Grid item xs={12}>
      <InfoColumn
        title={title}
        toolTipInfo={toolTipInfo}
        showDivider
        titleStyle={{ textTransform: 'capitalize' }}
        metric={
          <TokenAmount
            pt='6px'
            pl={2}
            amount={value[0]}
            symbol={value[1]}
            usdValue={usdValue}
          />
        }
      />
    </Grid>
  )
}

export default BalanceItem
