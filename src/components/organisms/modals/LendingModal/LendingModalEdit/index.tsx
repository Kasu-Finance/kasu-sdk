import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
import { formatUnits } from 'ethers/lib/utils'
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import LendingLiteLayout from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingLiteLayout'
import LendingProLayout from '@/components/organisms/modals/LendingModal/LendingModalEdit/LendingProLayout'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedTokens } from '@/constants/tokens'
import { formatAmount, toBigNumber } from '@/utils'
import calculateDepositMinMax from '@/utils/lending/calculateDepositMinMax'
import getAvailableFixedTermConfigs from '@/utils/lending/getAvailableFixedTermConfigs'

type DepositMinMax = {
  minDeposit: string
  maxDeposit: string
  remainingCapacity?: string
  epochMaxDeposit?: string
}

const getRemainingCapacityError = (remainingCapacityValue: string) =>
  toBigNumber(remainingCapacityValue).isZero()
    ? 'No remaining capacity for this tranche.'
    : `The value entered is above the remaining capacity of ${formatAmount(remainingCapacityValue)} USDC`

const LendingModalEdit = () => {
  const { setModalStatus } = useModalStatusState()

  const { isLiteMode } = useLiteModeState()
  const { modal } = useModalState()
  const { address } = usePrivyAuthenticated()

  const { pools } = modal[ModalsKeys.LEND]

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

  const getDefaultTranche = useCallback(
    (pool: PoolOverview) =>
      pool.tranches.find(
        (tranche) => !toBigNumber(tranche.maximumDeposit).isZero()
      ) ?? pool.tranches[0],
    []
  )

  const defaultTranche = useMemo(
    () => getDefaultTranche(pool),
    [getDefaultTranche, pool]
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

  const getDefaultFixedTermConfigId = useCallback(
    (tranche: PoolOverview['tranches'][number] | undefined) => {
      const fixedTermConfigs = getAvailableFixedTermConfigs(tranche, address)
      return fixedTermConfigs.length ? undefined : '0'
    },
    [address]
  )

  const [fixedTermConfigId, setFixedTermConfigId] = useState(
    prevFixedTermConfigId ?? getDefaultFixedTermConfigId(defaultTranche)
  )

  const selectedPoolData = useMemo(
    () => pools?.find((pool) => pool.id === selectedPool) ?? pool,
    [pools, pool, selectedPool]
  )

  const deferredAmountInUSD = useDeferredValue(amountInUSD)
  const deferredAmount = useDeferredValue(amount)

  const validate = useCallback(
    (
      amount: string,
      amountInUSD?: string,
      depositMinMax?: DepositMinMax,
      trancheId?: `0x${string}`
    ) => {
      try {
        if (!amount || !balance) return

        const balanceValue = formatUnits(balance, usdcDecimals)

        const inputBN = toBigNumber(amount)
        const inputUsdBN = toBigNumber(amountInUSD ?? amount)

        const activeTrancheId = trancheId ?? selectedTranche
        const limits =
          depositMinMax ??
          calculateDepositMinMax(
            selectedPoolData?.tranches ?? pool.tranches,
            activeTrancheId,
            currentEpochDepositedAmountMap,
            currentEpochFtdAmountMap,
            fixedTermConfigId
          )

        const min = limits.minDeposit ?? minDeposit
        const max = limits.maxDeposit ?? maxDeposit
        const remainingCapacityValue = limits.remainingCapacity ?? '0'
        const epochMaxDepositValue = limits.epochMaxDeposit ?? max

        const minDepositBN = toBigNumber(min)
        const maxDepositBN = toBigNumber(max)
        const balanceBN = toBigNumber(balanceValue)
        const remainingCapacityBN = toBigNumber(remainingCapacityValue)
        const epochMaxDepositBN = toBigNumber(epochMaxDepositValue)

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

        if (inputBN.gt(balanceBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is above your available balance of ${formatAmount(balanceValue)} USDC`,
          })
          return
        }

        if (inputUsdBN.gt(remainingCapacityBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: getRemainingCapacityError(remainingCapacityValue),
          })
          return
        }

        if (inputUsdBN.gt(epochMaxDepositBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is above the maximum deposit size for this epoch of ${formatAmount(epochMaxDepositValue)} USDC`,
          })
          return
        }

        if (inputUsdBN.gt(maxDepositBN)) {
          setModalStatus({
            type: 'error',
            errorMessage: `The value entered is above the maximum deposit size for this epoch of ${formatAmount(max)} USDC`,
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
      balance,
      usdcDecimals,
      selectedTranche,
      selectedPoolData,
      pool.tranches,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      fixedTermConfigId,
    ]
  )

  const setRemainingCapacityStatus = useCallback(
    (depositMinMax: DepositMinMax) => {
      const remainingCapacityValue = depositMinMax.remainingCapacity ?? '0'
      if (toBigNumber(remainingCapacityValue).isZero()) {
        setModalStatus({
          type: 'error',
          errorMessage: getRemainingCapacityError(remainingCapacityValue),
        })
        return true
      }

      return false
    },
    [setModalStatus]
  )

  useEffect(() => {
    if (amount || amountInUSD) return

    const depositMinMax = calculateDepositMinMax(
      selectedPoolData?.tranches ?? pool.tranches,
      selectedTranche,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      fixedTermConfigId
    )

    setRemainingCapacityStatus(depositMinMax)
  }, [
    amount,
    amountInUSD,
    selectedPoolData,
    pool.tranches,
    selectedTranche,
    currentEpochDepositedAmountMap,
    currentEpochFtdAmountMap,
    fixedTermConfigId,
    setRemainingCapacityStatus,
  ])

  const handlePoolChange = useCallback(
    (pool: PoolOverview) => {
      setModalStatus({ type: 'default' })

      const nextTranche = getDefaultTranche(pool)
      const nextFixedTermConfigId = getDefaultFixedTermConfigId(nextTranche)

      setSelectedPool(pool.id)
      setSelectedTranche(nextTranche.id as `0x${string}`)
      setFixedTermConfigId(nextFixedTermConfigId)

      const depositMinMax = calculateDepositMinMax(
        pool.tranches,
        nextTranche.id as `0x${string}`,
        currentEpochDepositedAmountMap,
        currentEpochFtdAmountMap,
        nextFixedTermConfigId
      )

      setDepositMinMax(depositMinMax)

      const hasNoCapacity = setRemainingCapacityStatus(depositMinMax)
      if (!nextFixedTermConfigId || hasNoCapacity) return

      validate(
        deferredAmount,
        deferredAmountInUSD,
        depositMinMax,
        nextTranche.id as `0x${string}`
      )
    },
    [
      setModalStatus,
      getDefaultTranche,
      getDefaultFixedTermConfigId,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      setDepositMinMax,
      setRemainingCapacityStatus,
      validate,
      deferredAmount,
      deferredAmountInUSD,
    ]
  )

  const handleTrancheChange = useCallback(
    (tranche: `0x${string}`, _defaultFixedTermConfigId: string | undefined) => {
      const selectedPoolTranches = selectedPoolData?.tranches ?? pool.tranches
      const selectedTrancheData = selectedPoolTranches.find(
        (poolTranche) => poolTranche.id === tranche
      )
      const nextFixedTermConfigId =
        getDefaultFixedTermConfigId(selectedTrancheData)

      setModalStatus({ type: 'default' })
      setSelectedTranche(tranche)
      setFixedTermConfigId(nextFixedTermConfigId)

      const depositMinMax = calculateDepositMinMax(
        selectedPoolTranches,
        tranche,
        currentEpochDepositedAmountMap,
        currentEpochFtdAmountMap,
        nextFixedTermConfigId
      )

      setDepositMinMax(depositMinMax)

      const hasNoCapacity = setRemainingCapacityStatus(depositMinMax)

      // skip validation and conversion when new tranche has fixed term options
      // since it will be validated when user selects a fixed term option which is required
      if (!nextFixedTermConfigId || hasNoCapacity) return

      validate(deferredAmount, deferredAmountInUSD, depositMinMax, tranche)
    },
    [
      setModalStatus,
      validate,
      deferredAmount,
      deferredAmountInUSD,
      selectedPoolData,
      pool.tranches,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      setDepositMinMax,
      getDefaultFixedTermConfigId,
      setRemainingCapacityStatus,
    ]
  )

  const handleFixedTermConfigChange = useCallback(
    (fixedTermConfigId: string | undefined) => {
      setModalStatus({ type: 'default' })
      setFixedTermConfigId(fixedTermConfigId)

      const depositMinMax = calculateDepositMinMax(
        selectedPoolData?.tranches ?? pool.tranches,
        selectedTranche,
        currentEpochDepositedAmountMap,
        currentEpochFtdAmountMap,
        fixedTermConfigId
      )

      setDepositMinMax(depositMinMax)

      const hasNoCapacity = setRemainingCapacityStatus(depositMinMax)
      if (hasNoCapacity) return

      validate(deferredAmount, deferredAmountInUSD, depositMinMax)
    },
    [
      setModalStatus,
      selectedTranche,
      deferredAmount,
      deferredAmountInUSD,
      selectedPoolData,
      pool.tranches,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      setDepositMinMax,
      setRemainingCapacityStatus,
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
