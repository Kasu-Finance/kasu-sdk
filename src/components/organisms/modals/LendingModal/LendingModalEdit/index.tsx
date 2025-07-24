import { Skeleton, Stack } from '@mui/material'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useCallback, useMemo, useState } from 'react'
import { useChainId } from 'wagmi'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useSupportedTokenUserBalances from '@/hooks/web3/useSupportedTokenUserBalances'

import Acknowledgement from '@/components/organisms/modals/LendingModal/LendingModalEdit/Acknowledgement'
import ApyDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/ApyDropdown'
import EarningsSimulator from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator'
import LendingModalEditActions from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingModalEditActions'
import LendingTrancheDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingTrancheDropdown'
import SecureSpotInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SecureSpotInfo'
import SelectedAssetInput from '@/components/organisms/modals/LendingModal/LendingModalEdit/SelectedAssetInput'
import SupportedAssetsDropdown from '@/components/organisms/modals/LendingModal/LendingModalEdit/SupportedAssetsDropdown'
import SwapInfo from '@/components/organisms/modals/LendingModal/LendingModalEdit/SwapInfo'

import { ModalsKeys } from '@/context/modal/modal.types'

import getSwapAmount from '@/actions/getSwapAmount'
import { SupportedTokens } from '@/constants/tokens'
import { formatAmount, toBigNumber } from '@/utils'
import calculateDepositMinMax from '@/utils/lending/calculateDepositMinMax'

const LendingModalEdit = () => {
  const chainId = useChainId()

  const { modal } = useModalState()

  const { pool } = modal[ModalsKeys.LEND]

  const { setModalStatus } = useModalStatusState()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  const supportedTokens = useSupportedTokenInfo()

  const {
    selectedToken: prevSelectedToken,
    amount: prevAmount,
    amountInUSD: prevAmountInUSD,
    trancheId: prevTrancheId,
    fixedTermConfigId: prevFixedTermConfigId,
    minDeposit,
    maxDeposit,
    currentEpochDepositedAmountMap,
    currentEpochFtdAmountMap,
    setDepositMinMax,
  } = useDepositModalState()

  const defaultTranche = useMemo(
    () =>
      pool.tranches.find(
        (tranche) => !toBigNumber(tranche.maximumDeposit).isZero()
      ) ?? pool.tranches[0],
    [pool]
  )

  const [isValidating, setIsValidating] = useState(false)
  const [selectedToken, setSelectedToken] = useState(
    prevSelectedToken ?? SupportedTokens.USDC
  )
  const [amount, setAmount] = useState(prevAmount ?? '')
  const [amountInUSD, setAmountInUSD] = useState<string | undefined>(
    prevAmountInUSD ?? undefined
  )
  const [selectedTranche, setSelectedTranche] = useState(
    prevTrancheId ?? (defaultTranche.id as `0x${string}`)
  )
  const [fixedTermConfigId, setFixedTermConfigId] = useState(
    prevFixedTermConfigId ??
      (defaultTranche.fixedTermConfig.length ? undefined : '0')
  )
  const validate = useCallback(
    (
      amount: string,
      amountInUSD?: string,
      depositMinMax?: { minDeposit: string; maxDeposit: string },
      token?: SupportedTokens
    ) => {
      try {
        if (!amount || !supportedTokenUserBalances) return

        const tokenBalance = supportedTokenUserBalances[token ?? selectedToken]

        const balance = formatUnits(tokenBalance.balance, tokenBalance.decimals)

        const inputBN = toBigNumber(amount)
        const inputUsdBN = toBigNumber(amountInUSD ?? amount)

        const min = depositMinMax?.minDeposit ?? minDeposit
        const max = depositMinMax?.maxDeposit ?? maxDeposit

        const minDepositBN = toBigNumber(min)
        const maxDepositBN = toBigNumber(max)
        const balanceBN = toBigNumber(balance)

        if (inputBN.isZero()) {
          setModalStatus({ type: 'error', errorMessage: 'Amount is required' })
          return
        }

        if (inputUsdBN.lt(minDepositBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is below the minimum of ${formatAmount(min)} USDC`,
          })
          return
        }

        if (inputUsdBN.gt(maxDepositBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is above the maximum of ${formatAmount(max)} USDC`,
          })
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
    [
      setModalStatus,
      minDeposit,
      maxDeposit,
      selectedToken,
      supportedTokenUserBalances,
    ]
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
        validate(fromAmount, formattedAmount, undefined, token)
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
      if (!amount) return

      if (token === SupportedTokens.USDC) {
        validate(amount, undefined, undefined, token)
        return
      }

      handleApplyConversion(amount, token)
    },
    [amount, setModalStatus, handleApplyConversion, validate]
  )

  const handleTrancheChange = useCallback(
    (tranche: `0x${string}`, defaultFixedTermConfigId: string | undefined) => {
      setModalStatus({ type: 'default' })
      setSelectedTranche(tranche)
      setFixedTermConfigId(defaultFixedTermConfigId)

      const depositMinMax = calculateDepositMinMax(
        pool.tranches,
        tranche,
        currentEpochDepositedAmountMap,
        currentEpochFtdAmountMap,
        defaultFixedTermConfigId
      )

      setDepositMinMax(depositMinMax)

      // skip validation and conversion when new tranche has fixed term options
      // since it will be validated when user selects a fixed term option which is required
      if (!defaultFixedTermConfigId) return

      validate(amount, amountInUSD, depositMinMax)
    },
    [
      setModalStatus,
      validate,
      amount,
      amountInUSD,
      pool.tranches,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      setDepositMinMax,
    ]
  )

  const handleFixedTermConfigChange = useCallback(
    (fixedTermConfigId: string | undefined) => {
      setFixedTermConfigId(fixedTermConfigId)

      const depositMinMax = calculateDepositMinMax(
        pool.tranches,
        selectedTranche,
        currentEpochDepositedAmountMap,
        currentEpochFtdAmountMap,
        fixedTermConfigId
      )

      setDepositMinMax(depositMinMax)

      validate(amount, amountInUSD, depositMinMax)
    },
    [
      selectedTranche,
      amount,
      amountInUSD,
      pool.tranches,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      setDepositMinMax,
      validate,
    ]
  )

  return (
    <Stack spacing={3} mt={3}>
      <SupportedAssetsDropdown
        selectedToken={selectedToken}
        setSelectedToken={handleTokenChange}
      />
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
      <SwapInfo
        amount={amount}
        amountInUSD={amountInUSD}
        selectedToken={selectedToken}
        isValidating={isValidating}
      />
      <LendingTrancheDropdown
        selectedTranche={selectedTranche}
        setSelectedTranche={handleTrancheChange}
      />
      <ApyDropdown
        fixedTermConfigId={fixedTermConfigId}
        selectedTrancheId={selectedTranche}
        setFixedTermConfigId={handleFixedTermConfigChange}
      />
      <EarningsSimulator
        amount={amount}
        amountInUSD={amountInUSD}
        trancheId={selectedTranche}
        fixedTermConfigId={fixedTermConfigId}
      />
      <Acknowledgement />
      <SecureSpotInfo />
      <LendingModalEditActions
        amount={amount}
        amountInUSD={amountInUSD}
        fixedTermConfigId={fixedTermConfigId}
        trancheId={selectedTranche}
        selectedToken={selectedToken}
      />
    </Stack>
  )
}

export default LendingModalEdit
