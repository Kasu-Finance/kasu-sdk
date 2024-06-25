import { formatEther } from 'ethers/lib/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useSimulateBonusYieldEarnings from '@/hooks/lending/useSimulateBonusYieldEarnings'
import useDebounce from '@/hooks/useDebounce'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { convertFromUSD, formatAmount, toBigNumber } from '@/utils'

type SimulatedBonusEarningsProps = {
  yieldEarnings: number[]
  bonusEpochInterest: number
}

const SimulatedBonusEarnings: React.FC<SimulatedBonusEarningsProps> = ({
  bonusEpochInterest,
  yieldEarnings,
}) => {
  const [bonusYieldEarnings, setBonusYieldEarnings] = useState([0])

  const { t } = useTranslation()

  const { amount, amountInUSD, simulatedDuration } = useDepositModalState()

  const { ksuPrice } = useKsuPrice()

  const simulateEarnings = useSimulateBonusYieldEarnings()

  const handleSimulateChange = useCallback(
    (earnedAmounts: number[], amount: number, bonusEpochInterest: number) => {
      const bonusYieldEarnings = simulateEarnings(
        earnedAmounts,
        amount,
        bonusEpochInterest
      )

      setBonusYieldEarnings(bonusYieldEarnings)
    },
    [simulateEarnings]
  )

  const { debouncedFunction, isDebouncing } = useDebounce(
    handleSimulateChange,
    2000
  )

  useEffect(() => {
    if (!amount) {
      setBonusYieldEarnings([0])
      return
    }
    debouncedFunction(
      yieldEarnings,
      parseFloat(amountInUSD ?? amount),
      bonusEpochInterest
    )
  }, [
    amount,
    amountInUSD,
    yieldEarnings,
    bonusEpochInterest,
    debouncedFunction,
  ])

  const bonusEarningsInKSU = useMemo(
    () =>
      convertFromUSD(
        toBigNumber(bonusYieldEarnings[simulatedDuration]?.toString() || '0'),
        toBigNumber(ksuPrice || '0')
      ),
    [bonusYieldEarnings, simulatedDuration, ksuPrice]
  )

  return (
    <BalanceItem
      title={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-4-title'
      )}
      titleStyle={{ whiteSpace: 'nowrap' }}
      toolTipInfo={t(
        'modals.earningsCalculator.simulatedYieldEarnings.metric-4-tooltip'
      )}
      value={[formatAmount(formatEther(bonusEarningsInKSU)), 'KSU']}
      usdValue={formatAmount(bonusYieldEarnings[simulatedDuration] || 0)}
      showSkeleton={isDebouncing}
    />
  )
}

export default SimulatedBonusEarnings
