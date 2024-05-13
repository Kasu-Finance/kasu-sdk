import RefreshIcon from '@mui/icons-material/Refresh'
import { Grid, Typography } from '@mui/material'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { formatEther } from 'ethers/lib/utils'
import { useState } from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'
import NumericalInput from '@/components/molecules/NumericalInput'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type UnlockAmountInputProps = {
  userLock: UserLock
}

const UnlockAmountInput: React.FC<UnlockAmountInputProps> = ({ userLock }) => {
  const { t } = useTranslation()

  const { amount, setAmount } = useLockModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const [focused, setFocused] = useState(false)

  const showSuccess = !focused && modalStatus.type === 'success'

  const { lockedAmount } = userLock

  const { ksuPrice } = useKsuPrice()

  const ksuInUSD = convertToUSD(
    toBigNumber(amount || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const handleMax = () => {
    setAmount(lockedAmount)
    validate(lockedAmount)
  }

  const validate = (amount: string) => {
    if (amount && toBigNumber(amount).gt(toBigNumber(userLock.lockedAmount))) {
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
    <Grid container columns={24} spacing={2} pt={1}>
      <BalanceItem
        title={t('modals.unlock.withdraw.withdraw-metric-3')}
        toolTipInfo={t('modals.unlock.withdraw.withdraw-metric-3-tooltip')}
        value={[formatAmount(lockedAmount), 'KSU']}
      />
      <Grid item xs={12}>
        <NumericalInput
          amount={amount}
          label={t('modals.unlock.withdraw.input-label')}
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
            error: modalStatus.type === 'error',
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

        {modalStatus.type === 'error' ? (
          <ColoredBox
            mt='3px'
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
        ) : (
          <Typography
            variant='caption'
            component='span'
            display='block'
            px={1.5}
            mt='3px'
            mb={0.5}
          >
            {formatAmount(formatEther(ksuInUSD))} USDC
          </Typography>
        )}
      </Grid>
    </Grid>
  )
}

export default UnlockAmountInput
