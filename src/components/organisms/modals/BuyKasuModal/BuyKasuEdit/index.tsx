import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useCallback, useDeferredValue, useState } from 'react'
import { useChainId } from 'wagmi'

import useBuyKasuModalState from '@/hooks/context/useBuyKasuModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import getTranslation from '@/hooks/useTranslation'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import ToolTip from '@/components/atoms/ToolTip'
import SupportedAssetsDropdown from '@/components/organisms/lending/SupportedAssetsDropdown'
import BuyKasuEditAction from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/BuyKasuEditAction'
import BuyKasuLock from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/BuyKasuLock'
import ExchangeRate from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/ExchangeRate'
import SelectedAssetInput from '@/components/organisms/modals/BuyKasuModal/BuyKasuEdit/SelectedAssetInput'

import OneInchLogo from '@/assets/logo/OneInchLogo'

import getSwapAmount from '@/actions/getSwapAmount'
import { SupportedTokens } from '@/constants/tokens'
import { toBigNumber } from '@/utils'

const BuyKasuModalEdit = () => {
  const { t } = getTranslation()

  const chainId = useChainId()

  const { setModalStatus } = useModalStatusState()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  const supportedTokens = useSupportedTokenInfo()

  const {
    selectedToken: prevSelectedToken,
    amount: prevAmount,
    amountInUSD: prevAmountInUSD,
    selectedLockPeriod: prevSelectedLockPeriod,
  } = useBuyKasuModalState()

  const [isValidating, setIsValidating] = useState(false)
  const [selectedToken, setSelectedToken] = useState(
    prevSelectedToken ?? SupportedTokens.USDC
  )
  const [amount, setAmount] = useState(prevAmount ?? '')

  const [amountInUSD, setAmountInUSD] = useState<string | undefined>(
    prevAmountInUSD ?? undefined
  )

  const [selectedLockPeriod, setSelectedLockPeriod] = useState(
    prevSelectedLockPeriod
  )

  const deferredAmountInUSD = useDeferredValue(amountInUSD)
  const deferredAmount = useDeferredValue(amount)

  const validate = useCallback(
    (amount: string, amountInUSD?: string, token?: SupportedTokens) => {
      try {
        if (!amount || !supportedTokenUserBalances) return

        const tokenBalance = supportedTokenUserBalances[token ?? selectedToken]

        const balance = tokenBalance.balance

        const inputBN = toBigNumber(amount)

        if (inputBN.isZero()) {
          setModalStatus({ type: 'error', errorMessage: 'Amount is required' })
          return
        }

        if (inputBN.gt(balance)) {
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
    [setModalStatus, selectedToken, supportedTokenUserBalances]
  )

  const handleApplyConversion = useCallback(
    async (fromAmount: string, token: SupportedTokens) => {
      if (!supportedTokens || token === SupportedTokens.USDC) return

      const toToken = supportedTokens[SupportedTokens.USDC]

      const fromToken = supportedTokens[token]

      try {
        setIsValidating(true)

        const usdAmount = await getSwapAmount({
          chainId,
          fromToken: fromToken.address,
          toToken: toToken.address,
          fromAmount: parseUnits(fromAmount, fromToken.decimals).toString(),
        })

        const formattedAmount = formatUnits(usdAmount || '0', toToken.decimals)

        setAmountInUSD(formattedAmount)
        validate(fromAmount, formattedAmount, token)
      } catch (error) {
        console.error(error)
      } finally {
        setIsValidating(false)
      }
    },
    [chainId, supportedTokens, validate, setAmountInUSD, setIsValidating]
  )

  const handleTokenChange = useCallback(
    (token: SupportedTokens) => {
      setModalStatus({ type: 'default' })
      setSelectedToken(token)
      setAmountInUSD(undefined)

      // skip validation and conversion if amount is not set
      if (!deferredAmount) return

      if (token === SupportedTokens.USDC) {
        validate(deferredAmount, undefined, token)
        return
      }

      handleApplyConversion(deferredAmount, token)
    },
    [deferredAmount, setModalStatus, handleApplyConversion, validate]
  )

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography
          variant='baseMd'
          display='inline-flex'
          alignItems='center'
          gap={1}
        >
          {t('modals.earningsCalculator.simulatedAmount.metric-1')}{' '}
          {selectedToken !== SupportedTokens.USDC && (
            <>
              {t('modals.earningsCalculator.simulatedAmount.metric-2')}
              <OneInchLogo />
            </>
          )}
        </Typography>
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
        <SupportedAssetsDropdown
          selectedToken={selectedToken}
          setSelectedToken={handleTokenChange}
        />
      </Stack>

      {!supportedTokenUserBalances || !supportedTokens ? (
        <Skeleton
          variant='rounded'
          sx={{ bgcolor: 'gold.extraDark' }}
          height={60}
        />
      ) : (
        <SelectedAssetInput
          validate={validate}
          selectedToken={selectedToken}
          amount={amount}
          setAmount={setAmount}
          amountInUSD={amountInUSD}
          setAmountInUSD={setAmountInUSD}
          isValidating={isValidating}
          setIsValidating={setIsValidating}
          supportedTokenUserBalances={supportedTokenUserBalances}
          supportedTokens={supportedTokens}
          applyConversion={handleApplyConversion}
        />
      )}
      <ExchangeRate
        amountInUSD={deferredAmountInUSD ?? deferredAmount ?? '0'}
      />

      <BuyKasuLock
        selectedLockPeriod={selectedLockPeriod}
        setSelectedLockPeriod={setSelectedLockPeriod}
      />
      <BuyKasuEditAction />
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
