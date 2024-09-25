'use client'

import LoginIcon from '@mui/icons-material/Login'
import { Box, Typography } from '@mui/material'
import { formatEther } from 'ethers/lib/utils'
import { ReactNode, useCallback, useMemo, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useDebounce from '@/hooks/useDebounce'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import NumericalInput from '@/components/molecules/NumericalInput'

import { formatAmount, toBigNumber } from '@/utils'
import { PoolData } from '@/utils/lending/getPoolData'

type DepositAmountInputProps = {
  balance: string
  decimals?: number
  poolData: PoolData
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
  const { t } = useTranslation()

  const { amount, trancheId, setAmount, setIsValidating } =
    useDepositModalState()
  const { modalStatus, setModalStatus } = useModalStatusState()

  const [focused, setFocused] = useState(false)

  const showSuccess = !focused && modalStatus.type === 'success'

  const { minDeposit, maxDeposit } = useMemo(() => {
    let tranche = poolData.tranches.find((t) => t.trancheId === trancheId)

    // If the tranche is not found by ID, fall back to names
    if (!tranche) {
      const tranchePriority = ['senior', 'mezzanine', 'junior']
      for (const name of tranchePriority) {
        tranche = poolData.tranches.find((t) =>
          t.title.toLowerCase().includes(name)
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
          setModalStatus({ type: 'error', errorMessage: 'Invalid amount' })

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

    applyConversion ? debouncedValidate(maxPossible) : validate(maxPossible)
  }, [
    balance,
    maxDeposit,
    setAmount,
    validate,
    applyConversion,
    debouncedValidate,
  ])

  const handleAmountChange = useCallback(
    (value: string) => {
      setIsValidating(true)
      setAmount(value)

      applyConversion ? debouncedValidate(value) : validate(value)
    },
    [setAmount, validate, applyConversion, debouncedValidate, setIsValidating]
  )

  const handleFocusState = useCallback(
    (state: boolean) => {
      if (state) {
        setFocused(true)

        setModalStatus({ type: 'focused' })
      } else {
        applyConversion ? debouncedValidate(amount) : validate(amount)
        setFocused(false)
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
          sx: (theme) => ({
            mt: 1,

            ...(showSuccess && {
              '& .MuiOutlinedInput-root fieldset': {
                borderColor: theme.palette.success.main,
              },
              '& .MuiInputLabel-outlined': {
                color: theme.palette.success.main,
              },
            }),
          }),
          onFocus: () => handleFocusState(true),
          onBlur: () => handleFocusState(false),
          error: modalStatus.type === 'error',
          InputLabelProps: {
            shrink: true,
          },
          InputProps: {
            startAdornment,
            endAdornment,
            sx: (theme) => ({
              '& .MuiInputBase-input': {
                px: 1,
              },
              '& svg > path': {
                fill: theme.palette.icon.primary,
              },
            }),
          },
        }}
      />

      {modalStatus.type === 'error' && (
        <ColoredBox
          mt='3px'
          mb={1}
          sx={{
            px: 1.5,
            py: 0,
            background: modalStatus.bgColor,
            maxWidth: 'calc(100% - 64px)',
          }}
        >
          <Typography
            variant='caption'
            component='span'
            color={(theme) => theme.palette.error.main}
          >
            {modalStatus.errorMessage}
          </Typography>
        </ColoredBox>
      )}
    </Box>
  )
}

export default DepositAmountInput
