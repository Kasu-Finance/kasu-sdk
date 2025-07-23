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

const LendingModalEdit = () => {
  const chainId = useChainId()

  const { modal } = useModalState()

  const { pool } = modal[ModalsKeys.LEND]

  const { setModalStatus } = useModalStatusState()

  const { supportedTokenUserBalances } = useSupportedTokenUserBalances()

  const supportedTokens = useSupportedTokenInfo()

  const { minDeposit, maxDeposit } = useDepositModalState()

  const defaultTranche = useMemo(
    () =>
      pool.tranches.find(
        (tranche) => !toBigNumber(tranche.maximumDeposit).isZero()
      ) ?? pool.tranches[0],
    [pool]
  )

  const [isValidating, setIsValidating] = useState(false)
  const [selectedToken, setSelectedToken] = useState(SupportedTokens.USDC)
  const [amount, setAmount] = useState('')
  const [amountInUSD, setAmountInUSD] = useState<string | undefined>(undefined)
  const [selectedTranche, setSelectedTranche] = useState(
    defaultTranche.id as `0x${string}`
  )
  const [fixedTermConfigId, setFixedTermConfigId] = useState(
    defaultTranche.fixedTermConfig.length ? undefined : '0'
  )
  const validate = useCallback(
    (amount: string, amountInUSD?: string) => {
      try {
        if (!amount || !supportedTokenUserBalances) return

        const tokenBalance = supportedTokenUserBalances[selectedToken]

        const balance = formatUnits(tokenBalance.balance, tokenBalance.decimals)

        const inputBN = toBigNumber(amount)
        const inputUsdBN = toBigNumber(amountInUSD ?? amount)
        const minDepositBN = toBigNumber(minDeposit)
        const maxDepositBN = toBigNumber(maxDeposit)
        const balanceBN = toBigNumber(balance)

        if (inputBN.isZero()) {
          setModalStatus({ type: 'error', errorMessage: 'Amount is required' })
          return
        }

        if (inputUsdBN.lt(minDepositBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is below the minimum of ${formatAmount(minDeposit)} USDC`,
          })
          return
        }

        if (inputUsdBN.gt(maxDepositBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is above the maximum of ${formatAmount(maxDeposit)} USDC`,
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
        validate(fromAmount, formattedAmount)
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

      if (token === SupportedTokens.USDC) {
        validate(amount)
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

      if (selectedToken === SupportedTokens.USDC) {
        validate(amount)
        return
      }

      handleApplyConversion(amount, selectedToken)
    },
    [setModalStatus, validate, amount, selectedToken, handleApplyConversion]
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
        setFixedTermConfigId={setFixedTermConfigId}
      />
      <EarningsSimulator />
      <Acknowledgement />
      <SecureSpotInfo />
      <LendingModalEditActions
        amount={amount}
        amountInUSD={amountInUSD}
        fixedTermConfigId={fixedTermConfigId}
        trancheId={selectedTranche}
      />
    </Stack>
  )
}

export default LendingModalEdit
