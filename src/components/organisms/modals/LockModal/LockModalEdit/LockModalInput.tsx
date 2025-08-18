import { Typography } from '@mui/material'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
} from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useUserBalance from '@/hooks/web3/useUserBalance'

import NumericalInput from '@/components/molecules/NumericalInput'

import { KsuIcon } from '@/assets/icons'

import sdkConfig from '@/config/sdk'
import { customTypography } from '@/themes/typography'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

type LockModalInputProps = {
  amount: string
  deferredAmount: string
  setAmount: Dispatch<SetStateAction<string>>
}

const LockModalInput: React.FC<LockModalInputProps> = ({
  amount,
  deferredAmount,
  setAmount,
}) => {
  const { t } = getTranslation()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const { balance: ksuBalance, decimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  const { ksuPrice } = useKsuPrice()

  const balance = useMemo(
    () => formatUnits(ksuBalance, decimals),
    [ksuBalance, decimals]
  )

  const ksuInUSD = useMemo(
    () =>
      convertToUSD(toBigNumber(deferredAmount), toBigNumber(ksuPrice || '0')),
    [deferredAmount, ksuPrice]
  )

  const validate = useCallback(
    (amount: string) => {
      if (amount && toBigNumber(amount).gt(toBigNumber(balance))) {
        setModalStatus({
          type: 'error',
          errorMessage: 'Insufficient balance',
        })
        return
      }

      if (toBigNumber(amount).isZero()) {
        setModalStatus({ type: 'error', errorMessage: 'Amount is required' })
        return
      }

      setModalStatus({ type: amount ? 'success' : 'default' })
    },
    [balance, setModalStatus]
  )

  const handleMax = useCallback(() => {
    setAmount(balance)
    validate(balance)
  }, [validate, balance, setAmount])

  return (
    <>
      <NumericalInput
        amount={amount}
        label={t('modals.lock.deposit.input-label')}
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
          onFocus: () => setModalStatus({ type: 'focused' }),
          onBlur: () => validate(amount),
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
                ~ {formatAmount(formatEther(ksuInUSD), { minDecimals: 2 })} USDC
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
        decimals={decimals}
      />
      <Typography
        variant='caption'
        component='span'
        sx={{ color: (theme) => theme.palette.error.main }}
        visibility={modalStatus.type === 'error' ? 'visible' : 'hidden'}
      >
        {modalStatus.type === 'error' ? modalStatus.errorMessage : 'message'}
      </Typography>
    </>
  )
}

export default memo(LockModalInput)
