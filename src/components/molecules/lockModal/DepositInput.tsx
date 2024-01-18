import {
  Box,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

type DepositInputProps = {
  amount: string
  setAmount: Dispatch<SetStateAction<string>>
}

const DepositInput: React.FC<DepositInputProps> = ({ amount, setAmount }) => {
  const handleMax = () => {
    setAmount('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        Deposit
      </Typography>
      <FormControl fullWidth variant='outlined' sx={{ mt: 1 }}>
        <InputLabel htmlFor='deposit-input'>Amount</InputLabel>
        <OutlinedInput
          label='Amount'
          id='deposit-input'
          value={amount}
          onChange={handleChange}
          endAdornment={<Button onClick={handleMax}>Max</Button>}
          sx={{ pr: 0 }}
        />
      </FormControl>
      <Typography
        mt='3px'
        ml={1.5}
        variant='caption'
        component='span'
        display='block'
      >
        Balance: 120.00 KSU
      </Typography>
    </Box>
  )
}

export default DepositInput
