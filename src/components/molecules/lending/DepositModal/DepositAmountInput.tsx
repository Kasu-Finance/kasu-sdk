import LoginIcon from '@mui/icons-material/Login'
import { Box, Typography } from '@mui/material'
import { useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'

import ColoredBox from '@/components/atoms/ColoredBox'
import NumericalInput from '@/components/molecules/NumericalInput'

import { toBigNumber } from '@/utils'

type DepositAmountInputProps = {
  balance: string
}

const DepositAmountInput: React.FC<DepositAmountInputProps> = ({ balance }) => {
  const { amount, setAmount } = useDepositModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const [focused, setFocused] = useState(false)

  const showSuccess = !focused && modalStatus.type === 'success'

  const handleMax = () => {
    setAmount(balance)
    validate(balance)
  }

  const validate = (amount: string) => {
    if (amount && toBigNumber(amount).gt(toBigNumber(balance))) {
      setModalStatus({
        type: 'error',
        errorMessage: 'insufficient balance',
      })
      return
    }

    if (amount && toBigNumber(amount).isZero()) {
      setModalStatus({ type: 'error', errorMessage: 'invalid amount' })
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
