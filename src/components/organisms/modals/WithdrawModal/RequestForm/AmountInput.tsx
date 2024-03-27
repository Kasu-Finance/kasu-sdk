import LogoutIcon from '@mui/icons-material/Logout'
import { Box, Typography, useTheme } from '@mui/material'
import React, { useCallback, useMemo } from 'react'

import useTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

interface AmountInputProps {
  amount: string
  errorMsg: string
  setErrorMsg: (msg: string) => void
  setAmount: (amount: string) => void
}

const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  errorMsg,
  setErrorMsg,
  setAmount,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const validateAmount = useCallback(
    (input: string) => {
      const errorInput = '123'
      // TODO - change this to a valid condition
      if (input === errorInput) {
        setErrorMsg(t('lending.withdraw.errors.invalidCriteria'))
        return false
      } else {
        setErrorMsg('')
        return true
      }
    },
    [t, setErrorMsg]
  )

  const handleAmountChange = (value: string) => {
    setAmount(value)
    validateAmount(value)
  }

  const handleMax = () => {
    const maxAmount = '100' // TODO - get the max amount
    validateAmount(maxAmount)
    setAmount(maxAmount)
  }

  const isAmountValid = useMemo(
    () => (amount && validateAmount(amount)) || false,
    [amount, validateAmount]
  )

  const numericalInputRootProps = {
    sx: {
      mt: 1,
      '& .MuiOutlinedInput-root': {
        fieldset: {
          borderColor: isAmountValid ? theme.palette.success.main : '',
        },
      },
      '& .MuiInputLabel-root': {
        color: isAmountValid ? theme.palette.success.main : '',
      },
      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: isAmountValid ? theme.palette.success.main : '',
      },
      '& .MuiInputBase-input': {
        pl: 1,
      },
    },
    error: !!errorMsg,
    InputProps: {
      startAdornment: <LogoutIcon sx={{ color: theme.palette.icon.primary }} />,
      endAdornment: 'USDC',
    },
  }

  return (
    <Box>
      <NumericalInput
        amount={amount}
        handleMax={handleMax}
        setAmount={handleAmountChange}
        label={t('lending.withdraw.inputLabel')}
        rootProps={numericalInputRootProps}
      />
      {errorMsg && (
        <Typography variant='caption' color={theme.palette.error.main}>
          {errorMsg}
        </Typography>
      )}
    </Box>
  )
}

export default AmountInput
