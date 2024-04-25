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
  poolData: PoolData
}

const DepositAmountInput: React.FC<DepositAmountInputProps> = ({
  balance,
  poolData,
}) => {
  const { amount, trancheId, setAmount } = useDepositModalState()
  const { modalStatus, setModalStatus } = useModalStatusState()

  const [focused, setFocused] = useState(false)

  const showSuccess = !focused && modalStatus.type === 'success'

  const { minDeposit, maxDeposit } = useMemo(() => {
    // try to find the tranche by ID
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
    const maxPossible = toBigNumber(maxDeposit).lt(toBigNumber(balance))
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
        errorMessage: `Minimum deposit is ${minDeposit} USDC`,
      })
      return
    }

    if (inputBN.gt(maxDepositBN)) {
      setModalStatus({
        type: 'error',
        errorMessage: `Maximum deposit is ${maxDeposit} USDC`,
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
        setAmount={setAmount}
        handleMax={handleMax}
        decimals={6}
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
