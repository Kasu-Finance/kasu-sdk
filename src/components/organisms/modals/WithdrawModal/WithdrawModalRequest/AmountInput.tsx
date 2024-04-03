import LogoutIcon from '@mui/icons-material/Logout'
import { Box, Typography, useTheme } from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

import { toBigNumber } from '@/utils'

interface AmountInputProps {
  balance: string
  amount: string
  setAmount: (amount: string) => void
}

const AmountInput: React.FC<AmountInputProps> = ({
  balance,
  amount,
  setAmount,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { modalStatus, setModalStatus } = useModalStatusState()
  const [focused, setFocused] = useState(false)

  const showSuccess = !focused && modalStatus.type === 'success'

  const validateAmount = useCallback(
    (input: string) => {
      if (input && toBigNumber(input).gt(toBigNumber(balance))) {
        setModalStatus({
          type: 'error',
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
      setModalStatus({ type: 'focused' })
    } else {
      validateAmount(amount)
      setFocused(false)
    }
  }

  const errorMsg = modalStatus.type === 'error' ? modalStatus.errorMessage : ''

  const numericalInputRootProps = useMemo(
    () => ({
      sx: () => ({
        mt: 1,
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
      }),
      error: !!errorMsg,
      onFocus: () => handleFocusState(true),
      onBlur: () => handleFocusState(false),
      InputProps: {
        startAdornment: (
          <LogoutIcon sx={{ color: theme.palette.icon.primary }} />
        ),
        endAdornment: 'USDC',
      },
    }),
    [errorMsg, showSuccess, theme, handleFocusState]
  )

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
