import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'
import { useCallback, useDeferredValue, useState } from 'react'

import useBuyKasuModalState from '@/hooks/context/useBuyKasuModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import getTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import ToolTip from '@/components/atoms/ToolTip'
import BuyAmountInput from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/BuyAmountInput'
import BuyKasuEditAction from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/BuyKasuEditAction'
import BuyKasuLock from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/BuyKasuLock'
import ExchangeRate from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/ExchangeRate'

import { SupportedTokens } from '@/constants/tokens'
import { toBigNumber } from '@/utils'

const BuyKasuModalEdit = () => {
  const { t } = getTranslation()

  const { setModalStatus } = useModalStatusState()

  const supportedTokens = useSupportedTokenInfo()
  const usdcToken = supportedTokens?.[SupportedTokens.USDC]
  const { balance, decimals } = useUserBalance(usdcToken?.address)
  const usdcDecimals = decimals ?? 6
  const usdcBalance = balance ? formatUnits(balance, usdcDecimals) : '0'

  const { amount: prevAmount, selectedLockPeriod: prevSelectedLockPeriod } =
    useBuyKasuModalState()

  const selectedToken = SupportedTokens.USDC
  const [amount, setAmount] = useState(prevAmount ?? '')

  const [selectedLockPeriod, setSelectedLockPeriod] = useState(
    prevSelectedLockPeriod
  )

  const deferredAmount = useDeferredValue(amount)

  const validate = useCallback(
    (amount: string) => {
      try {
        if (!amount || !balance) return

        const balanceValue = formatUnits(balance, usdcDecimals)

        const balanceBN = toBigNumber(balanceValue)

        const inputBN = toBigNumber(amount)

        if (inputBN.isZero()) {
          setModalStatus({ type: 'error', errorMessage: 'Amount is required' })
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
      } catch (error) {
        console.error(error)
      }
    },
    [setModalStatus, balance, usdcDecimals]
  )

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Box display='flex' alignItems='center'>
          <Typography
            variant='baseMd'
            display='inline-flex'
            alignItems='center'
            gap={1}
            color='gold.dark'
          >
            {t('modals.earningsCalculator.simulatedAmount.metric-3')}{' '}
          </Typography>
          <ToolTip
            title='info'
            iconSx={{
              color: 'gold.dark',
              '&:hover': {
                color: 'gold.extraDark',
              },
            }}
          />
        </Box>
      </Stack>

      {!supportedTokens ? (
        <Skeleton
          variant='rounded'
          sx={{ bgcolor: 'gold.extraDark' }}
          height={60}
        />
      ) : (
        <BuyAmountInput
          validate={validate}
          selectedToken={selectedToken}
          amount={amount}
          amountInUSD={amount}
          setAmount={setAmount}
          setAmountInUSD={() => {}}
          balance={usdcBalance}
          decimals={usdcDecimals}
          applyConversion={() => {}}
          startAdornment={
            <Box display='flex' alignItems='center'>
              {supportedTokens[SupportedTokens.USDC].icon.dark}
              <Typography
                variant='inherit'
                component='span'
                color='gold.extraDark'
                ml={1}
              >
                {SupportedTokens.USDC}
              </Typography>
            </Box>
          }
          endAdornment={null}
          debounceTime={500}
        />
      )}
      <ExchangeRate amountInUSD={deferredAmount ?? '0'} />

      <BuyKasuLock
        selectedLockPeriod={selectedLockPeriod}
        setSelectedLockPeriod={setSelectedLockPeriod}
      />
      <BuyKasuEditAction
        amount={deferredAmount}
        amountInUSD={deferredAmount}
        selectedLockPeriod={selectedLockPeriod}
        selectedToken={selectedToken}
      />
      <Typography
        variant='baseMd'
        display='inline-flex'
        alignItems='center'
        gap={1}
        color='gold.extraDark'
      >
        {t('modals.buyKasu.completed.disclaimer')}
      </Typography>
    </Stack>
  )
}

export default BuyKasuModalEdit
