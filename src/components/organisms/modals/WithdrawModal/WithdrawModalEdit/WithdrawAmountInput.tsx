import { Box, Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import { useCallback } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useWithdrawModalState from '@/hooks/context/useWithdrawModalState'
import useTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import NumericalInput from '@/components/molecules/NumericalInput'

import { ModalsKeys } from '@/context/modal/modal.types'
import { ModalStatus } from '@/context/modalStatus/modalStatus.types'

import { SupportedTokens } from '@/constants/tokens'
import { customTypography } from '@/themes/typography'
import { toBigNumber } from '@/utils'

const WithdrawAmountInput = () => {
  const { t } = useTranslation()

  const { modal } = useModalState()

  const { trancheBalance } = modal[ModalsKeys.WITHDRAW]

  const supportedToken = useSupportedTokenInfo()
  const usdcDecimals = supportedToken?.[SupportedTokens.USDC].decimals

  const { amount, trancheId, setAmount } = useWithdrawModalState()

  const { modalStatus, setModalStatus } = useModalStatusState()

  const selectedTranche = trancheBalance.find(
    (tranche) => tranche.id === trancheId
  )

  const balance = formatUnits(
    selectedTranche?.balanceData.availableToWithdraw || '0',
    usdcDecimals
  )

  const validateAmount = useCallback(
    (inputAmount: string) => {
      const inputBN = toBigNumber(inputAmount)

      if (inputBN.isZero()) {
        setModalStatus({
          type: ModalStatus.ERROR,
          errorMessage: 'Amount is required',
        })

        return
      }

      if (toBigNumber(inputAmount).gt(toBigNumber(balance))) {
        setModalStatus({
          type: ModalStatus.ERROR,
          errorMessage: 'Insufficient Balance',
        })
        return
      }

      setModalStatus({ type: inputAmount ? 'success' : 'default' })
      return
    },
    [balance, setModalStatus]
  )

  const handleAmountChange = (value: string) => {
    setAmount(value)
    validateAmount(value)
  }

  const handleMax = () => {
    setAmount(balance)
    validateAmount(balance)
  }

  const handleFocusState = (state: boolean) => {
    if (state) {
      setModalStatus({ type: ModalStatus.FOCUSED })
    } else {
      validateAmount(amount)
    }
  }

  return (
    <Box>
      <NumericalInput
        amount={amount}
        handleMax={handleMax}
        setAmount={handleAmountChange}
        label={t('lending.withdraw.amountInput.label')}
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
            endAdornment: 'USDC',
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
                px: 3,
              },
            },
          },
        }}
        decimals={supportedToken?.[SupportedTokens.USDC].decimals}
      />
      <Typography
        variant='caption'
        component='span'
        color={(theme) => theme.palette.error.main}
        visibility={modalStatus.type === 'error' ? 'visible' : 'hidden'}
      >
        {modalStatus.type === 'error' ? modalStatus.errorMessage : 'message'}
      </Typography>
    </Box>
  )
}

export default WithdrawAmountInput
