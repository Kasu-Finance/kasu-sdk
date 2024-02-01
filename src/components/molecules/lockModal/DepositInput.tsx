import { Box, Typography } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

import NumericalInput from '@/components/molecules/NumericalInput'

type DepositInputProps = {
  balance: string
  amount: string
  setAmount: Dispatch<SetStateAction<string>>
}

const DepositInput: React.FC<DepositInputProps> = ({
  balance,
  amount,
  setAmount,
}) => {
  const handleMax = () => setAmount(balance)

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        Deposit
      </Typography>
      <NumericalInput
        amount={amount}
        setAmount={setAmount}
        formControlProps={{ sx: { mt: 1 } }}
        handleMax={handleMax}
      />
      <Typography
        mt='3px'
        ml={1.5}
        variant='caption'
        component='span'
        display='block'
      >
        Balance: {balance} KSU
      </Typography>
    </Box>
  )
}

export default DepositInput
