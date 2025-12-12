import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { formatUnits } from 'ethers/lib/utils'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import LendingLiteLayout from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingLiteLayout'
import LendingProLayout from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingProLayout'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount, toBigNumber } from '@/utils'
import calculateDepositMinMax from '@/utils/lending/calculateDepositMinMax'

const LendingModalEdit = () => {
  const { setModalStatus } = useModalStatusState()

  const { isLiteMode } = useLiteModeState()

  const supportedTokens = useSupportedTokenInfo()
  const usdcToken = supportedTokens?.[SupportedTokens.USDC]
  const { balance, decimals } = useUserBalance(usdcToken?.address)
  const usdcDecimals = decimals ?? 6
  const usdcBalance = balance ? formatUnits(balance, usdcDecimals) : '0'

  const {
    pool,
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

  const [selectedPool, setSelectedPool] = useState(pool.id)
  const selectedToken = SupportedTokens.USDC
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

  const deferredAmountInUSD = useDeferredValue(amountInUSD)
  const deferredAmount = useDeferredValue(amount)

  const validate = useCallback(
    (
      amount: string,
      amountInUSD?: string,
      depositMinMax?: { minDeposit: string; maxDeposit: string }
    ) => {
      try {
        if (!amount || !balance) return

        const balanceValue = formatUnits(balance, usdcDecimals)

        const inputBN = toBigNumber(amount)
        const inputUsdBN = toBigNumber(amountInUSD ?? amount)

        const min = depositMinMax?.minDeposit ?? minDeposit
        const max = depositMinMax?.maxDeposit ?? maxDeposit

        const minDepositBN = toBigNumber(min)
        const maxDepositBN = toBigNumber(max)
        const balanceBN = toBigNumber(balanceValue)

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
    [setModalStatus, minDeposit, maxDeposit, balance, usdcDecimals]
  )

  const handlePoolChange = useCallback((pool: PoolOverview) => {
    setSelectedPool(pool.id)
    setSelectedTranche(pool.tranches[0].id as `0x${string}`)
  }, [])

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

      validate(deferredAmount, deferredAmountInUSD, depositMinMax)
    },
    [
      setModalStatus,
      validate,
      deferredAmount,
      deferredAmountInUSD,
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

      validate(deferredAmount, deferredAmountInUSD, depositMinMax)
    },
    [
      selectedTranche,
      deferredAmount,
      deferredAmountInUSD,
      pool.tranches,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      setDepositMinMax,
      validate,
    ]
  )

  const props = {
    selectedPool,
    selectedToken,
    supportedTokens,
    amount,
    deferredAmount,
    amountInUSD,
    deferredAmountInUSD,
    fixedTermConfigId,
    selectedTranche,
    setSelectedPool,
    setAmount,
    setAmountInUSD,
    validate,
    handlePoolChange,
    handleFixedTermConfigChange,
    handleTrancheChange,
    usdcBalance,
    usdcDecimals,
  }

  return isLiteMode ? (
    <LendingLiteLayout {...props} />
  ) : (
    <LendingProLayout {...props} />
  )
}

export default LendingModalEdit
