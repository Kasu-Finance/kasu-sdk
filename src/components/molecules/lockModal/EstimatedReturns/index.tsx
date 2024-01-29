import { Box, Divider, Typography } from '@mui/material'
import React from 'react'

import useEstimatedDepositValue from '@/hooks/locking/useEstimatedDepositValue'

import ColoredBox from '@/components/atoms/ColoredBox'

import EstimatesRow from './EstimatesRow'

type EstimatedReturnsProps = {
  amount: string
}

const EstimatedReturns: React.FC<EstimatedReturnsProps> = ({ amount }) => {
  const estimatedDepositValueUSD = useEstimatedDepositValue(amount)

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        Estimates
      </Typography>
      <ColoredBox mt={1}>
        <EstimatesRow
          title='Deposit value in USD at current exchange rate'
          info='info'
          value={`$ ${estimatedDepositValueUSD}`}
        />
        <Divider />
        <EstimatesRow
          title='Launch Bonus KASU from locking'
          info='info'
          value='0.00 KSU'
        />
        <Divider />
        <EstimatesRow title='Projected APY' info='info' value='0.00 %' />
        <Divider />
        <EstimatesRow
          title='Projected USDC earning at current APY'
          info='info'
          value='0.00 USDC'
        />
      </ColoredBox>
    </Box>
  )
}

export default EstimatedReturns
