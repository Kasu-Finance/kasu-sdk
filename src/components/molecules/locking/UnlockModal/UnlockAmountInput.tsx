import { Grid, Typography } from '@mui/material'
import { UserLock } from 'kasu-sdk/src/types'
import { useState } from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'

import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'
import NumericalInput from '@/components/molecules/NumericalInput'

import { RefreshIcon } from '@/assets/icons'

import { toBigNumber } from '@/utils'

type UnlockAmountInputProps = {
  userLock: UserLock
}

const UnlockAmountInput: React.FC<UnlockAmountInputProps> = ({ userLock }) => {
  const { amount, lockState, setAmount, setLockState } = useLockModalState()

  const [focused, setFocused] = useState(false)

  const showSuccess = !focused && lockState.type === 'success'

  const { lockedAmount } = userLock

  const handleMax = () => {
    setAmount(lockedAmount)
    validate(lockedAmount)
  }

  const validate = (amount: string) => {
    if (amount && toBigNumber(amount).gt(toBigNumber(userLock.lockedAmount))) {
      setLockState({
        type: 'error',
        errorMessage: 'insufficient balance',
      })
      return
    }

    if (amount && toBigNumber(amount).isZero()) {
      setLockState({ type: 'error', errorMessage: 'invalid amount' })
      return
    }

    setLockState({ type: amount ? 'success' : 'default' })
  }

  const handleFocusState = (state: boolean) => {
    if (state) {
      setFocused(true)
      setLockState({ type: 'focused' })
    } else {
      validate(amount)
      setFocused(false)
    }
  }

  return (
    <Grid container columns={24} spacing={2} pt={1}>
      <BalanceItem
        title='Available KSU to Unlock'
        toolTipInfo='info'
        value={[lockedAmount, 'KSU']}
      />
      <Grid item xs={12}>
        <NumericalInput
          amount={amount}
          label='Unlock Amount'
          setAmount={setAmount}
          handleMax={handleMax}
          rootProps={{
            sx: (theme) => ({
              mt: 1.5,
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
            error: lockState.type === 'error',
            InputLabelProps: {
              shrink: true,
            },
            InputProps: {
              startAdornment: <RefreshIcon />,
              endAdornment: 'KSU',
              sx: {
                px: 1.5,
                '& .MuiInputBase-input': {
                  px: 1,
                },
                '& svg': {
                  width: '100%',
                  height: 'auto',
                  maxWidth: '23px',
                },
              },
            },
          }}
        />

        {lockState.type === 'error' ? (
          <ColoredBox
            mt='3px'
            sx={{
              px: 1.5,
              py: 0,
              background: lockState.bgColor,
              maxWidth: 'calc(100% - 64px)',
            }}
          >
            <Typography
              variant='caption'
              component='span'
              color={(theme) => theme.palette.error.main}
            >
              {lockState.errorMessage}
            </Typography>
          </ColoredBox>
        ) : (
          <Typography
            variant='caption'
            component='span'
            display='block'
            px={1.5}
            mt='3px'
            mb={0.5}
          >
            500.00 USDC
          </Typography>
        )}
      </Grid>
    </Grid>
  )
}

export default UnlockAmountInput
