'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Typography } from '@mui/material'
import { Dispatch, ReactNode, SetStateAction, useCallback } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useDebounce from '@/hooks/useDebounce'
import getTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

import { SupportedTokens } from '@/constants/tokens'
import { customTypography } from '@/themes/typography'
import { toBigNumber } from '@/utils'

type BuyAmountInputProps = {
  selectedToken: SupportedTokens
  amount: string
  amountInUSD: string | undefined
  setAmount: Dispatch<SetStateAction<string>>
  setAmountInUSD: Dispatch<SetStateAction<string | undefined>>
  balance: string
  decimals?: number
  disabled?: boolean
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  applyConversion: (fromAmount: string, token: SupportedTokens) => void
  debounceTime?: number
  validate: (amount: string, amountInUSD?: string) => void
}

const BuyAmountInput: React.FC<BuyAmountInputProps> = ({
  selectedToken,
  amount,
  amountInUSD,
  setAmount,
  setAmountInUSD,
  balance,
  decimals = 18,
  validate,
  disabled,
  startAdornment = <LoginIcon />,
  endAdornment = 'USDC',
  debounceTime = 1000,
  applyConversion,
}) => {
  const { t } = getTranslation()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { debouncedFunction: debouncedValidate } = useDebounce(
    validate,
    debounceTime,
    true
  )

  const { debouncedFunction: debouncedApplyConversion } = useDebounce(
    applyConversion,
    debounceTime,
    true
  )

  const handleAmountChange = useCallback(
    (value: string) => {
      // reset modal state when amount changes
      if (modalStatus.type === 'error') {
        setModalStatus({ type: 'default' })
      }

      setAmount(value)

      // if value is empty skip validation and conversions and reset converted amount
      if (!value) {
        setAmountInUSD(undefined)
        return
      }

      if (selectedToken === SupportedTokens.USDC) {
        setAmountInUSD(value)
        debouncedValidate(value)
        return
      }

      debouncedApplyConversion(value, selectedToken)
    },
    [
      setAmountInUSD,
      selectedToken,
      modalStatus,
      debouncedApplyConversion,
      setAmount,
      setModalStatus,
      debouncedValidate,
    ]
  )

  const handleMax = useCallback(() => {
    if (toBigNumber(balance).isZero()) {
      setAmount('0')
      setAmountInUSD('0')
      return
    }

    setAmount(balance)

    if (selectedToken === SupportedTokens.USDC) {
      setAmountInUSD(balance)
      debouncedValidate(balance)

      return
    }

    applyConversion(balance, selectedToken)
  }, [
    balance,
    selectedToken,
    setAmount,
    setAmountInUSD,
    applyConversion,
    debouncedValidate,
  ])

  return (
    <Box>
      <NumericalInput
        amount={amount}
        label={t('modals.lock.swapAndDeposit.input-label')}
        setAmount={handleAmountChange}
        handleMax={handleMax}
        decimals={decimals}
        disabled={disabled}
        rootProps={{
          sx: {
            mt: 1,
            borderRadius: 30,
            bgcolor: 'gold.middle',

            '.MuiInputBase-root': {
              bgcolor: 'inherit',
            },
          },
          onFocus: () => setModalStatus({ type: 'focused' }),
          onBlur: () => {
            validate(amount, amountInUSD)
          },
          error: modalStatus.type === 'error',
          InputLabelProps: {
            shrink: true,
            sx: {
              ...customTypography.baseMd,
              color: 'white',
              ml: 1.3,
            },
          },
          InputProps: {
            startAdornment,
            endAdornment,
            sx: {
              height: 48,
              borderRadius: 'inherit',

              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',

                legend: {
                  ...customTypography.baseMd,
                  fontSize: `calc(${customTypography.baseMd.fontSize}px * 0.75)`,
                  ml: 1.3,
                },
              },
              '& .MuiInputBase-input': {
                px: 1,
              },
            },
          },
        }}
      />
      <Typography
        variant='caption'
        component='span'
        sx={{ color: (theme) => theme.palette.error.main }}
        visibility={modalStatus.type === 'error' ? 'visible' : 'hidden'}
      >
        {modalStatus.type === 'error' ? modalStatus.errorMessage : 'message'}
      </Typography>
    </Box>
  )
}

export default BuyAmountInput
