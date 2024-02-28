import { alpha, Box, Typography } from '@mui/material'
import { useState } from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import NumericalInput from '@/components/molecules/NumericalInput'

import { LockIcon } from '@/assets/icons'

import { toBigNumber } from '@/utils'

type LockAmountInputProps = {
  balance: string
}

const LockAmountInput: React.FC<LockAmountInputProps> = ({ balance }) => {
  const { amount, setAmount, lockState, setLockState } = useLockModalState()

  const [focused, setFocused] = useState(false)

  const showSuccess =
    !toBigNumber(amount).isZero() && !focused && lockState.type !== 'error'

  const handleMax = () => {
    setAmount(balance)
    validate(balance)
  }
  const { t } = useTranslation()

  const validate = (amount: string) => {
    if (amount && toBigNumber(amount).gt(toBigNumber('100'))) {
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

    setLockState({ type: 'default' })
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
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        {t('modals.lock.deposit.title')}
      </Typography>
      <NumericalInput
        amount={amount}
        label={t('modals.lock.deposit.input-label')}
        setAmount={setAmount}
        handleMax={handleMax}
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
          error: lockState.type === 'error',
          InputLabelProps: {
            shrink: true,
          },
          InputProps: {
            startAdornment: <LockIcon />,
            endAdornment: 'KSU',
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
      {lockState.type === 'error' && (
        <ColoredBox
          mt='3px'
          sx={(theme) => ({
            px: 1.5,
            py: 0,
            background: alpha(theme.palette.error.main, 0.04),
          })}
        >
          <Typography
            variant='caption'
            component='span'
            color={(theme) => theme.palette.error.main}
          >
            {lockState.errorMessage}
          </Typography>
        </ColoredBox>
      )}
      <ColoredBox
        mt={1.5}
        sx={{
          bgcolor: lockState.bgColor,
        }}
      >
        <InfoRow
          title={t('modals.lock.deposit.metric')}
          metric={
            <Box>
              <TokenAmount amount='5,000.00' symbol='USDC' />
            </Box>
          }
        />
      </ColoredBox>
    </Box>
  )
}

export default LockAmountInput
