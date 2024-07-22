import { Grid, SxProps, Theme, TypographyProps } from '@mui/material'
import React from 'react'

import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

type BalanceItemProps = {
  title: string
  toolTipInfo: string
  value: string[]
  usdValue?: string
  titleStyle?: TypographyProps
  showSkeleton?: boolean
  tokenAmountSx?: SxProps<Theme>
}

const BalanceItem: React.FC<BalanceItemProps> = ({
  title,
  toolTipInfo,
  value,
  usdValue,
  titleStyle = { textTransform: 'capitalize', fontSize: { xs: 12, sm: 14 } },
  showSkeleton,
  tokenAmountSx,
}) => {
  return (
    <Grid item xs={12}>
      <InfoColumn
        title={title}
        toolTipInfo={toolTipInfo}
        titleContainerSx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            px: 0,
          },
        })}
        showDivider
        titleStyle={titleStyle}
        metric={
          <TokenAmount
            pt='6px'
            pl={{ xs: 0, sm: 2 }}
            amount={value[0]}
            symbol={value[1]}
            usdValue={usdValue}
            showSkeleton={showSkeleton}
            sx={tokenAmountSx}
          />
        }
      />
    </Grid>
  )
}

export default BalanceItem
