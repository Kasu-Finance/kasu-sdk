import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { useCallback, useEffect, useMemo, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useSimulateYieldEarnings from '@/hooks/lending/useSimulateYieldEarnings'
import useDebounce from '@/hooks/useDebounce'
import useTranslation from '@/hooks/useTranslation'

import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { formatAmount } from '@/utils'

type DefaultEarningsProps = {
  poolOverview: PoolOverview
}

const SimulatedDefaultEarnings: React.FC<DefaultEarningsProps> = ({
  poolOverview,
}) => {
  const [yieldEarnings, setYieldEarnings] = useState([0])

  const { t } = useTranslation()

  const { amount, amountInUSD, trancheId, simulatedDuration } =
    useDepositModalState()

  const simulateEarnings = useSimulateYieldEarnings()

  const selectedTranche = useMemo(
    () => poolOverview.tranches.find((tranche) => tranche.id === trancheId),
    [poolOverview.tranches, trancheId]
  )

  const handleSimulateChange = useCallback(
    (amount: number, apy: number, duration: number) => {
      const yieldEarnings = simulateEarnings(amount, apy, duration)

      setYieldEarnings(yieldEarnings)
    },
    [simulateEarnings]
  )

  const { debouncedFunction, isDebouncing } = useDebounce(
    handleSimulateChange,
    2000
  )

  useEffect(() => {
    if (!amount || !selectedTranche?.apy) {
      setYieldEarnings([0])
      return
    }

    debouncedFunction(
      parseFloat(amountInUSD ?? amount),
      parseFloat(selectedTranche.apy),
      365
    )
  }, [amount, amountInUSD, selectedTranche?.apy, debouncedFunction])

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
