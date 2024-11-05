'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { ReactNode, useCallback, useMemo } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useDebounce from '@/hooks/useDebounce'
import getTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

import { customTypography } from '@/themes/typography'
import { formatAmount, toBigNumber } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type DepositAmountInputProps = {
  balance: string
  decimals?: number
  poolData: PoolOverviewWithDelegate
  disabled?: boolean
  startAdornment?: ReactNode
  endAdornment?: ReactNode
  applyConversion?: (newAmount: string) => Promise<string>
  debounceTime?: number
  currentEpochDepositedAmount: string
}

const DepositAmountInput: React.FC<DepositAmountInputProps> = ({
  balance,
  decimals = 18,
  poolData,
  disabled,
  startAdornment = <LoginIcon />,
  endAdornment = 'USDC',
  debounceTime = 1000,
  currentEpochDepositedAmount,
  applyConversion,
}) => {
  const { t } = getTranslation()

  const { amount, trancheId, setAmount, setAmountInUSD, setIsValidating } =
    useDepositModalState()
  const { modalStatus, setModalStatus } = useModalStatusState()

  const { minDeposit, maxDeposit } = useMemo(() => {
    let tranche = poolData.tranches.find((t) => t.id === trancheId)

    // If the tranche is not found by ID, fall back to names
    if (!tranche) {
      const tranchePriority = ['senior', 'mezzanine', 'junior']
      for (const name of tranchePriority) {
        tranche = poolData.tranches.find((t) =>
          t.name.toLowerCase().includes(name)
        )
        if (tranche) break
      }
    }

    let trancheMin = toBigNumber(tranche?.minimumDeposit ?? '0')
    let trancheMax = toBigNumber(tranche?.maximumDeposit ?? '0')

    const currentDepositedAmount = toBigNumber(currentEpochDepositedAmount)

    // if user has deposited once in this epoch, they already have deposited the minimum requirement
    // and such, the max amount he can deposit into this epoch
    // should reflect/subtracted from his previous deposits in the same epoch
    if (!currentDepositedAmount.isZero()) {
      trancheMin = toBigNumber('1')
      trancheMax = trancheMax.sub(currentDepositedAmount)
    }

    return {
      minDeposit: formatEther(trancheMin),
      maxDeposit: formatEther(trancheMax),
    }
  }, [poolData.tranches, trancheId, currentEpochDepositedAmount])

  const validate = useCallback(
    async (inputAmount: string) => {
      try {
        let convertedAmount: string = '0'

        const inputBN = toBigNumber(inputAmount)
        const minDepositBN = toBigNumber(minDeposit)
        const maxDepositBN = toBigNumber(maxDeposit)
        const balanceBN = toBigNumber(balance)

        if (inputBN.isZero()) {
          setModalStatus({ type: 'error', errorMessage: 'Amount is required' })

          return
        }

        if (applyConversion) {
          convertedAmount = await applyConversion(inputAmount)
        }

        const inputUsdBN = applyConversion
          ? toBigNumber(convertedAmount)
          : inputBN

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

        setModalStatus({ type: inputAmount ? 'success' : 'default' })
      } catch (error) {
        console.error(error)
      } finally {
        setIsValidating(false)
      }
    },
    [
      setModalStatus,
      minDeposit,
      maxDeposit,
      balance,
      applyConversion,
      setIsValidating,
    ]
  )

  const { debouncedFunction: debouncedValidate } = useDebounce(
    validate,
    debounceTime,
    true
  )

  const handleMax = useCallback(() => {
    const maxPossible = toBigNumber(maxDeposit).lt(toBigNumber(balance))
      ? maxDeposit
      : balance

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
    maxDeposit,
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
      validate,
      applyConversion,
      debouncedValidate,
      setIsValidating,
      setAmountInUSD,
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

export default DepositAmountInput
