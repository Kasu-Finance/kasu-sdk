import LoginIcon from '@mui/icons-material/Login'
import { Box, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'

import ColoredBox from '@/components/atoms/ColoredBox'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import NumericalInput from '@/components/molecules/NumericalInput'

import { toBigNumber } from '@/utils'

type DepositAmountInputProps = {
  balance: string
  decimals?: number
  poolData: PoolData
  disabled?: boolean
}

const DepositAmountInput: React.FC<DepositAmountInputProps> = ({
  balance,
  decimals = 18,
  poolData,
  disabled,
}) => {
  const { amount, trancheId, setAmount } = useDepositModalState()
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

    return {
      minDeposit: tranche ? tranche.minimumDeposit : '0',
      maxDeposit: tranche ? tranche.maximumDeposit : '0',
    }
  }, [poolData.tranches, trancheId])

  const handleMax = () => {
    const maxPossible = toBigNumber(balance).gt(toBigNumber(maxDeposit))
      ? maxDeposit
      : balance

    setAmount(maxPossible)
    validate(maxPossible)
  }

  const validate = (inputAmount: string) => {
    const inputBN = toBigNumber(inputAmount)
    const minDepositBN = toBigNumber(minDeposit)
    const maxDepositBN = toBigNumber(maxDeposit)
    const balanceBN = toBigNumber(balance)

    if (inputBN.isZero()) {
      setModalStatus({ type: 'error', errorMessage: 'Invalid amount' })
      return
    }

    if (inputBN.lt(minDepositBN)) {
      setModalStatus({
        type: 'error',
        errorMessage: `The value entered is below the minimum of ${minDeposit} USDC`,
      })
      return
    }

    if (inputBN.gt(maxDepositBN)) {
      setModalStatus({
        type: 'error',
        errorMessage: `The value entered is above the maximum of ${maxDeposit} USDC`,
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
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    validate(value)
  }

  const handleFocusState = (state: boolean) => {
    if (state) {
      setFocused(true)

      setModalStatus({ type: 'focused' })
    } else {
      validate(amount)
      setFocused(false)
    }
  }

  return (
    <Box>
      <NumericalInput
        amount={amount}
        label='Deposit Amount'
        setAmount={handleAmountChange}
        handleMax={handleMax}
        decimals={decimals}
        disabled={disabled}
        rootProps={{
          sx: (theme) => ({
            mt: 1,

            ...(showSuccess && {
              '& .MuiOutlinedInput-root': {
                color: theme.palette.success.main,
                '& fieldset': {
                  borderColor: theme.palette.success.main,
                },
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
            startAdornment: <LoginIcon />,
            endAdornment: 'USDC',
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
