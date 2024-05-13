import LockClockIcon from '@mui/icons-material/LockClock'
import { Box, Typography } from '@mui/material'
import { useState } from 'react'

import useLockModalState from '@/hooks/context/useLockModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useEstimatedDepositValue from '@/hooks/locking/useEstimatedDepositValue'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import NumericalInput from '@/components/molecules/NumericalInput'

import { formatAmount, toBigNumber } from '@/utils'

type LockAmountInputProps = {
  balance: string
}

const LockAmountInput: React.FC<LockAmountInputProps> = ({ balance }) => {
  const { amount, setAmount } = useLockModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const [focused, setFocused] = useState(false)

  const estimatedDepositValue = useEstimatedDepositValue(amount)

  const showSuccess = !focused && modalStatus.type === 'success'

  const handleMax = () => {
    setAmount(balance)
    validate(balance)
  }
  const { t } = useTranslation()

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
      <Typography variant='subtitle1' component='span' display='block'>
        {t('modals.lock.deposit.amount-title')}
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
          error: modalStatus.type === 'error',
          InputLabelProps: {
            shrink: true,
          },
          InputProps: {
            startAdornment: <LockClockIcon />,
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
      {modalStatus.type === 'error' ? (
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
      ) : (
        <Typography
          variant='caption'
          component='span'
          display='block'
          mt='3px'
          mx={1.5}
          mb={1.5}
        >
          {formatAmount(estimatedDepositValue)} USDC
        </Typography>
      )}
      <InfoRow
        title={t('modals.lock.deposit.amount-metric-1')}
        toolTipInfo={t('modals.lock.deposit.amount-metric-1-tooltip')}
        showDivider
        metric={<TokenAmount amount='500.00' symbol='KSU' />}
      />
      <InfoRow
        title={t('modals.lock.deposit.amount-metric-2')}
        toolTipInfo={t('modals.lock.deposit.amount-metric-2-tooltip')}
        showDivider
        metric={<TokenAmount amount='1,000.00' symbol='KSU' />}
      />
    </Box>
  )
}

export default LockAmountInput
