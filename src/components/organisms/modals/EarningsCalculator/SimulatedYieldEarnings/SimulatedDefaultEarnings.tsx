import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useSimulateYieldEarnings from '@/hooks/lending/useSimulateYieldEarnings'
import useDebounce from '@/hooks/useDebounce'
import useTranslation from '@/hooks/useTranslation'
import usePerformanceFee from '@/hooks/web3/usePerformanceFee'

import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { formatAmount } from '@/utils'

type DefaultEarningsProps = {
  poolOverview: PoolOverview
  yieldEarnings: number[]
  setYieldEarnings: Dispatch<SetStateAction<number[]>>
}

const SimulatedDefaultEarnings: React.FC<DefaultEarningsProps> = ({
  poolOverview,
  yieldEarnings,
  setYieldEarnings,
}) => {
  const { t } = useTranslation()

  const { amount, amountInUSD, trancheId, simulatedDuration } =
    useDepositModalState()

  const simulateEarnings = useSimulateYieldEarnings()

  const { performanceFee } = usePerformanceFee()

  const selectedTranche = useMemo(
    () => poolOverview.tranches.find((tranche) => tranche.id === trancheId),
    [poolOverview.tranches, trancheId]
  )

  const handleSimulateChange = useCallback(
    (
      amount: number,
      interestRate: number,
      daysInvested: number,
      interestFee: number
    ) => {
      const yieldEarnings = simulateEarnings(
        amount,
        interestRate,
        daysInvested,
        interestFee
      )

      setYieldEarnings(yieldEarnings)
    },
    [simulateEarnings, setYieldEarnings]
  )

  const { debouncedFunction, isDebouncing } = useDebounce(
    handleSimulateChange,
    2000
  )

  useEffect(() => {
    if (!amount || !selectedTranche?.interestRate || !performanceFee) {
      setYieldEarnings([0])
      return
    }

    debouncedFunction(
      parseFloat(amountInUSD ?? amount),
      parseFloat(selectedTranche.interestRate),
      365,
      performanceFee / 100
    )
  }, [
    amount,
    performanceFee,
    amountInUSD,
    selectedTranche?.interestRate,
    debouncedFunction,
    setYieldEarnings,
  ])

  return (
    <BalanceItem
      title={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-2-title'
      )}
      toolTipInfo={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-2-tooltip'
      )}
      value={[formatAmount(yieldEarnings[simulatedDuration] || 0), 'USDC']}
      showSkeleton={isDebouncing}
    />
  )
}

export default SimulatedDefaultEarnings
