'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Typography } from '@mui/material'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { Dispatch, ReactNode, SetStateAction, useCallback } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useDebounce from '@/hooks/useDebounce'
import getTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

// import useLendingModalState from '@/store/lendingModal'
import getSwapAmount from '@/actions/getSwapAmount'
import { customTypography } from '@/themes/typography'
import { formatAmount, toBigNumber } from '@/utils'

type DepositAmountInputProps = {
  amount: string
  setAmount: Dispatch<SetStateAction<string>>
  setAmountInUSD: Dispatch<SetStateAction<string | undefined>>
  balance: string
  decimals?: number
  disabled?: boolean
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  applyConversion?: {
    fromToken: {
      address: `0x${string}`
      decimals: number
    }
    toToken: {
      address: `0x${string}`
      decimals: number
    }
    chainId: number
  }
  debounceTime?: number
  setIsValidating: Dispatch<SetStateAction<boolean>>
  // currentEpochDepositedAmount: string
  // currentEpochFtdAmount: string[]
}

const DepositAmountInput: React.FC<DepositAmountInputProps> = ({
  amount,
  setAmount,
  setAmountInUSD,
  balance,
  decimals = 18,

  disabled,
  startAdornment = <LoginIcon />,
  endAdornment = 'USDC',
  debounceTime = 1000,
  applyConversion,
  setIsValidating,
}) => {
  const { t } = getTranslation()

  const { minDeposit, maxDeposit } = useDepositModalState()

  // const amount = useLendingModalState((state) => state.amount)
  // const setAmount = useLendingModalState((state) => state.setAmount)

  const { modalStatus, setModalStatus } = useModalStatusState()

  const handleAmountChange = async (value: string) => {
    setAmount(value)

    if (!applyConversion) {
      setAmountInUSD(value)
      debouncedValidate(value)
      return
    }

    handleApplyConversion(value, applyConversion)
  }

  const validate = useCallback(
    async (amount: string, amountInUSD?: string) => {
      try {
        if (!amount) return

        const inputBN = toBigNumber(amount)
        const inputUsdBN = toBigNumber(amountInUSD ?? amount)
        const minDepositBN = toBigNumber(minDeposit)
        const maxDepositBN = toBigNumber(maxDeposit)
        const balanceBN = toBigNumber(balance)

        if (inputBN.isZero()) {
          setModalStatus({ type: 'error', errorMessage: 'Amount is required' })
          return
        }

        if (inputUsdBN.lt(minDepositBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is below the minimum of ${formatAmount(minDeposit)} USDC`,
          })
          return
        }

        if (inputUsdBN.gt(maxDepositBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is above the maximum of ${formatAmount(maxDeposit)} USDC`,
          })
          return
        }

        if (inputBN.gt(balanceBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: 'Insufficient balance',
          })

          return
        }

        setModalStatus({ type: amount ? 'success' : 'default' })
      } catch (error) {
        console.error(error)
      }
    },
    [setModalStatus, minDeposit, maxDeposit, balance]
  )

  const handleApplyConversion = useCallback(
    async (
      value: string,
      applyConversion: NonNullable<DepositAmountInputProps['applyConversion']>
    ) => {
      try {
        setIsValidating(true)

        const usdAmount = await getSwapAmount({
          chainId: applyConversion.chainId,
          fromToken: applyConversion.fromToken.address,
          toToken: applyConversion.toToken.address,
          fromAmount: parseUnits(
            value,
            applyConversion.fromToken.decimals
          ).toString(),
        })

        const formattedAmount = formatUnits(
          usdAmount || '0',
          applyConversion.toToken.decimals
        )

        setAmountInUSD(formattedAmount)
        validate(value, formattedAmount)
      } catch (error) {
        console.error(error)
      } finally {
        setIsValidating(false)
      }
    },
    [validate, setAmountInUSD, setIsValidating]
  )

  const { debouncedFunction: debouncedValidate } = useDebounce(
    validate,
    debounceTime,
    true
  )

  // const handleAmountChange = useCallback(
  //   async (value: string) => {
  //     setAmount(value)

  //     // if (selectedToken === SupportedTokens.USDC) {
  //     //   setAmountInUSD(value)
  //     //   return
  //     // }

  //
  //   },
  //   [setAmount, setAmountInUSD, selectedToken, setIsValidating, applyConversion]
  // )

  const handleMax = useCallback(() => {
    if (toBigNumber(balance).isZero()) {
      setAmount('0')
      setAmountInUSD('0')
      return
    }

    const maxPossible = toBigNumber(maxDeposit).lt(toBigNumber(balance))
      ? maxDeposit
      : balance

    setAmount(maxPossible)

    if (!applyConversion) {
      setAmountInUSD(maxPossible)
      debouncedValidate(maxPossible)

      return
    }

    handleApplyConversion(maxPossible, applyConversion)

    // if (applyConversion) {
    //   debouncedValidate(maxPossible)
    // } else {
    //   validate(maxPossible)
    // }
  }, [
    balance,
    maxDeposit,
    setAmount,
    setAmountInUSD,
    applyConversion,
    handleApplyConversion,
    debouncedValidate,
  ])

  // const handleAmountChange = useCallback(
  //   (value: string) => {
  //     setIsValidating(true)
  //     setAmount(value)

  //     if (applyConversion) {
  //       debouncedValidate(value)
  //     } else {
  //       validate(value)
  //       setAmountInUSD(value)
  //     }
  //   },
  //   [
  //     setAmount,
  //     setAmountInUSD,
  //     validate,
  //     applyConversion,
  //     debouncedValidate,
  //     setIsValidating,
  //   ]
  // )

  // const handleFocusState = useCallback(
  //   (state: boolean) => {
  //     if (state) {
  //       setModalStatus({ type: 'focused' })
  //     } else {
  //       applyConversion ? debouncedValidate(amount) : validate(amount)
  //     }
  //   },
  //   [amount, setModalStatus, validate, applyConversion, debouncedValidate]
  // )

  // useEffect(() => {
  //   if (!fixedTermConfigId) return

  //   applyConversion ? debouncedValidate(amount) : validate(amount)
  //   // eslint-disable-next-line
  // }, [
  //   trancheId,
  //   fixedTermConfigId,
  //   applyConversion,
  //   validate,
  //   debouncedValidate,
  // ])

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
          // onFocus: () => handleFocusState(true),
          // onBlur: () => handleFocusState(false),
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

export default DepositAmountInput
