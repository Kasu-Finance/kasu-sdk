'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Typography } from '@mui/material'
import { ReactNode, useCallback } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useDebounce from '@/hooks/useDebounce'
import getTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

import useBuyKasuModalState from '@/hooks/context/useBuyKasuModalState'
import { customTypography } from '@/themes/typography'
import { toBigNumber } from '@/utils'

type BuyAmountInputProps = {
  balance: string
  decimals?: number
  disabled?: boolean
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  applyConversion?: (newAmount: string) => Promise<string>
  debounceTime?: number
}

const BuyAmountInput: React.FC<BuyAmountInputProps> = ({
  balance,
  decimals = 18,
  disabled,
  startAdornment = <LoginIcon />,
  endAdornment = 'USDC',
  debounceTime = 1000,
  applyConversion,
}) => {
  const { t } = getTranslation()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { amount, setAmount, setAmountInUSD, setIsValidating } =
    useBuyKasuModalState()

  const validate = useCallback(
    async (inputAmount: string) => {
      try {
        // let convertedAmount: string = '0'

        const inputBN = toBigNumber(inputAmount)
        const balanceBN = toBigNumber(balance)

        if (inputBN.isZero()) {
          setModalStatus({ type: 'error', errorMessage: 'Amount is required' })

          return
        }

        // if (applyConversion) {
        //   convertedAmount = await applyConversion(inputAmount)
        // }

        // const inputUsdBN = applyConversion
        //   ? toBigNumber(convertedAmount)
        //   : inputBN

        if (inputBN.gt(balanceBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: 'Insufficient balance',
          })

          return
        }

        setModalStatus({ type: inputAmount ? 'success' : 'default' })
      } catch (error) {
        console.error(error)
      } finally {
        setIsValidating(false)
      }
    },
    [setModalStatus, balance, setIsValidating]
  )

  const { debouncedFunction: debouncedValidate } = useDebounce(
    validate,
    debounceTime,
    true
  )

  const handleMax = useCallback(() => {
    const maxPossible = balance

    setAmount(maxPossible)

    if (toBigNumber(balance).isZero()) {
      return
    }

    setIsValidating(true)

    if (applyConversion) {
      debouncedValidate(maxPossible)
    } else {
      validate(maxPossible)
      setAmountInUSD(maxPossible)
    }
  }, [
    balance,
    setAmount,
    setAmountInUSD,
    validate,
    applyConversion,
    debouncedValidate,
    setIsValidating,
  ])

  const handleAmountChange = useCallback(
    (value: string) => {
      setIsValidating(true)
      setAmount(value)

      if (applyConversion) {
        debouncedValidate(value)
      } else {
        validate(value)
        setAmountInUSD(value)
      }
    },
    [
      setAmount,
      setAmountInUSD,
      validate,
      applyConversion,
      debouncedValidate,
      setIsValidating,
    ]
  )

  const handleFocusState = useCallback(
    (state: boolean) => {
      if (state) {
        setModalStatus({ type: 'focused' })
      } else {
        applyConversion ? debouncedValidate(amount) : validate(amount)
      }
    },
    [amount, setModalStatus, validate, applyConversion, debouncedValidate]
  )

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
          onFocus: () => handleFocusState(true),
          onBlur: () => handleFocusState(false),
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
