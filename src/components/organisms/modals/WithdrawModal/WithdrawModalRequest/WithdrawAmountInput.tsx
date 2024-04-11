import LogoutIcon from '@mui/icons-material/Logout'
import { Box, Typography, useTheme } from '@mui/material'
import React, { useCallback, useState } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

import { ModalStatus } from '@/context/modalStatus/modalStatus.types'

import { toBigNumber } from '@/utils'

interface WithdrawAmountInputProps {
  balance: string
  amount: string
  setAmount: (amount: string) => void
}

const WithdrawAmountInput: React.FC<WithdrawAmountInputProps> = ({
  balance,
  amount,
  setAmount,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { modalStatus, setModalStatus } = useModalStatusState()
  const [focused, setFocused] = useState(false)

  const validateAmount = useCallback(
    (input: string) => {
      if (input && toBigNumber(input).gt(toBigNumber(balance))) {
        setModalStatus({
          type: ModalStatus.ERROR,
          errorMessage: t('lending.withdraw.errors.invalidCriteria'),
        })
        return false
      }

      if (input && toBigNumber(input).isZero()) {
        setModalStatus({
          type: 'error',
          errorMessage: t('lending.withdraw.errors.invalidCriteria'),
        })
        return false
      }

      setModalStatus({ type: input ? 'success' : 'default' })
      return true
    },
    [balance, setModalStatus, t]
  )

  const handleAmountChange = (value: string) => {
    setAmount(value)
    validateAmount(value)
  }

  const handleMax = () => {
    setAmount(balance)
    validateAmount(balance)
  }

  const handleFocusState = (state: boolean) => {
    if (state) {
      setFocused(true)
      setModalStatus({ type: ModalStatus.FOCUSED })
    } else {
      validateAmount(amount)
      setFocused(false)
    }
  }

  const showSuccess = !focused && modalStatus.type === ModalStatus.SUCCESS
  const errorMsg =
    modalStatus.type === ModalStatus.ERROR ? modalStatus.errorMessage : ''

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      fieldset: {
        borderColor: showSuccess ? theme.palette.success.main : '',
      },
    },
    '& .MuiInputLabel-root': {
      color: showSuccess ? theme.palette.success.main : '',
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: showSuccess ? theme.palette.success.main : '',
    },
    '& .MuiInputBase-input': {
      pl: 1,
    },
  }
  const numericalInputRootProps = {
    sx: inputStyles,
    error: !!errorMsg,
    onFocus: () => handleFocusState(true),
    onBlur: () => handleFocusState(false),
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
        label={t('lending.withdraw.amountInput.label')}
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

export default WithdrawAmountInput
