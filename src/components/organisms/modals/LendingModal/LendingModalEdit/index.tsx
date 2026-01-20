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

const MIN_CAPACITY = toBigNumber('1')

const getRemainingCapacityError = (remainingCapacityValue: string) =>
  toBigNumber(remainingCapacityValue).lt(MIN_CAPACITY)
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
    setSelectedPool: setSelectedPoolState,
    setDepositMinMax,
  } = useDepositModalState()

  const getDefaultFixedTermConfigId = useCallback(
    (tranche: PoolOverview['tranches'][number] | undefined) => {
      const fixedTermConfigs = getAvailableFixedTermConfigs(tranche, address)
      return fixedTermConfigs.length ? undefined : '0'
    },
    [address]
  )

  const trancheHasCapacity = useCallback(
    (candidatePool: PoolOverview, trancheId?: `0x${string}`) => {
      if (!trancheId) return false

      const tranche = candidatePool.tranches.find((tr) => tr.id === trancheId)
      if (!tranche) return false

      const defaultFixedTermConfigId = getDefaultFixedTermConfigId(tranche)
      const depositMinMax = calculateDepositMinMax(
        candidatePool.tranches,
        tranche.id as `0x${string}`,
        currentEpochDepositedAmountMap,
        currentEpochFtdAmountMap,
        defaultFixedTermConfigId
      )

      const remainingCapacityValue = depositMinMax.remainingCapacity ?? '0'

      return !toBigNumber(remainingCapacityValue).lt(MIN_CAPACITY)
    },
    [
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      getDefaultFixedTermConfigId,
    ]
  )

  const hasCapacity = useCallback(
    (candidate: PoolOverview) =>
      candidate.tranches.some((tranche) =>
        trancheHasCapacity(candidate, tranche.id as `0x${string}`)
      ),
    [trancheHasCapacity]
  )

  const getDefaultTranche = useCallback(
    (pool: PoolOverview) =>
      pool.tranches.find((tranche) =>
        trancheHasCapacity(pool, tranche.id as `0x${string}`)
      ) ?? pool.tranches[0],
    [trancheHasCapacity]
  )

  const initialPool = useMemo(() => {
    if (pools?.length) {
      const firstWithCapacity = pools.find((p) => hasCapacity(p))
      if (firstWithCapacity) return firstWithCapacity
    }

    return pool
  }, [pools, pool, hasCapacity])

  const defaultTranche = useMemo(
    () => getDefaultTranche(initialPool),
    [getDefaultTranche, initialPool]
  )

  const initialTrancheId = useMemo(() => {
    const existsInInitialPool = initialPool.tranches.some(
      (tranche) => tranche.id === prevTrancheId
    )

    if (existsInInitialPool && trancheHasCapacity(initialPool, prevTrancheId)) {
      return prevTrancheId as `0x${string}`
    }

    return defaultTranche.id as `0x${string}`
  }, [initialPool, prevTrancheId, defaultTranche.id, trancheHasCapacity])

  const [selectedPool, setSelectedPool] = useState(initialPool.id)
  const selectedToken = SupportedTokens.USDC
  const [amount, setAmount] = useState(prevAmount ?? '')

  const [amountInUSD, setAmountInUSD] = useState<string | undefined>(
    prevAmountInUSD ?? undefined
  )

  const [selectedTranche, setSelectedTranche] = useState(initialTrancheId)

  const initialTrancheData = useMemo(
    () =>
      initialPool.tranches.find((tranche) => tranche.id === initialTrancheId) ??
      defaultTranche,
    [initialPool.tranches, initialTrancheId, defaultTranche]
  )

  const [fixedTermConfigId, setFixedTermConfigId] = useState(
    prevFixedTermConfigId ?? getDefaultFixedTermConfigId(initialTrancheData)
  )

  const selectedPoolData = useMemo(
    () => pools?.find((pool) => pool.id === selectedPool) ?? pool,
    [pools, pool, selectedPool]
  )

  const isTrancheDisabled = useCallback(
    (trancheId: `0x${string}`) => {
      const activePool = selectedPoolData ?? pool
      return !trancheHasCapacity(activePool, trancheId)
    },
    [selectedPoolData, pool, trancheHasCapacity]
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
      if (toBigNumber(remainingCapacityValue).lt(MIN_CAPACITY)) {
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

    setDepositMinMax({
      minDeposit: depositMinMax.minDeposit,
      maxDeposit: depositMinMax.maxDeposit,
    })
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
    setDepositMinMax,
    setRemainingCapacityStatus,
  ])

  useEffect(() => {
    if (selectedPoolData) {
      setSelectedPoolState(selectedPoolData)
    }
  }, [selectedPoolData, setSelectedPoolState])

  const handlePoolChange = useCallback(
    (pool: PoolOverview) => {
      setModalStatus({ type: 'default' })

      const nextTranche = getDefaultTranche(pool)
      const nextFixedTermConfigId = getDefaultFixedTermConfigId(nextTranche)

      setSelectedPool(pool.id)
      setSelectedTranche(nextTranche.id as `0x${string}`)
      setFixedTermConfigId(nextFixedTermConfigId)
      setSelectedPoolState(pool)

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
      setSelectedPoolState,
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

      if (!trancheHasCapacity(selectedPoolData ?? pool, tranche)) return

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
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      setDepositMinMax,
      getDefaultFixedTermConfigId,
      setRemainingCapacityStatus,
      trancheHasCapacity,
      pool,
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
    isTrancheDisabled,
    isPoolFull: (candidate: PoolOverview) => !hasCapacity(candidate),
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
