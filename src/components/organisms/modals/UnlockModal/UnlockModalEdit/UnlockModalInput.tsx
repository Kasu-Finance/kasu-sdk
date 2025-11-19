import { UserLock } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { formatEther } from 'ethers/lib/utils'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useUnlockModalState from '@/hooks/context/useUnlockModalState'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import NumericalInput from '@/components/molecules/NumericalInput'

import { KsuIcon } from '@/assets/icons'

import { customTypography } from '@/themes/typography'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type UnlockModalInputProps = {
  userLock: UserLock
}

const UnlockModalInput: React.FC<UnlockModalInputProps> = ({ userLock }) => {
  const { t } = getTranslation()

  const { amount, setAmount } = useUnlockModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { ksuPrice } = useKsuPrice()

  const ksuInUSD = convertToUSD(
    toBigNumber(amount || '0'),
    toBigNumber(ksuPrice || '0')
  )

  const handleMax = () => {
    setAmount(userLock.lockedAmount)
    validate(userLock.lockedAmount)
  }

  const validate = (amount: string) => {
    if (toBigNumber(amount).isZero()) {
      setModalStatus({ type: 'error', errorMessage: 'Amount is required' })
      return
    }

    if (toBigNumber(amount).gt(toBigNumber(userLock.lockedAmount))) {
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
      setModalStatus({ type: 'focused' })
    } else {
      validate(amount)
    }
  }

  return (
    <Box>
      <NumericalInput
        amount={amount}
        label={t('modals.unlock.withdraw.input-label')}
        setAmount={setAmount}
        handleMax={handleMax}
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
            startAdornment: <KsuIcon />,
            endAdornment: (
              <Typography
                whiteSpace='nowrap'
                variant='inherit'
                component='span'
                color='gold.extraDark'
              >
                ~{' '}
                {formatAmount(formatEther(ksuInUSD || '0'), {
                  minDecimals: 2,
                  minValue: 10_000,
                })}{' '}
                USDC
              </Typography>
            ),
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

export default UnlockModalInput
