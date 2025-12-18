import { Box } from '@mui/material'
import React, { memo, useMemo, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'

import SimulatedBaseApy from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBaseApy'
import SimulatedBonusApy from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBonusApy'
import SimulatedBonusEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBonusEarnings'
import SimulatedDefaultEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedDefaultEarnings'

import { ModalsKeys } from '@/context/modal/modal.types'

import { TimeConversions } from '@/utils'

type SimulatedYieldEarningsProps = {
  fixedTermConfigId?: string
  trancheId: `0x${string}`
  simulatedDuration: number
  isDebouncing: boolean
  amount: string
  amountInUSD?: string
  currentLevel: LoyaltyLevel
}

const getBonusEpochInterest = (loyaltyLevel: LoyaltyLevel) => {
  switch (loyaltyLevel) {
    case 1:
      return 0.000019164956
    case 2:
      return 0.000038329912
    default:
      return 0
  }
}

const SimulatedYieldEarnings: React.FC<SimulatedYieldEarningsProps> = ({
  currentLevel,
  amount,
  amountInUSD,
  trancheId,
  fixedTermConfigId,
  isDebouncing,
  simulatedDuration,
}) => {
  const { modal } = useModalState()
  const pool = modal[ModalsKeys.LEND].pool

  const [yieldEarnings, setYieldEarnings] = useState([0])

  const bonusEpochInterest = getBonusEpochInterest(currentLevel)

  const effectiveDuration = useMemo(() => {
    if (!fixedTermConfigId || fixedTermConfigId.toString() === '0') {
      return simulatedDuration
    }

    const selectedTranche = pool.tranches.find(
      (tranche) => tranche.id === trancheId
    )

    const fixedTermConfig = selectedTranche?.fixedTermConfig.find(
      ({ configId }) => configId === fixedTermConfigId
    )

    const epochs = parseFloat(fixedTermConfig?.epochLockDuration ?? '')
    const fixedTermDays = Number.isFinite(epochs)
      ? Math.round(epochs * TimeConversions.DAYS_PER_WEEK)
      : simulatedDuration

    return Math.min(365, Math.max(0, fixedTermDays))
  }, [fixedTermConfigId, pool.tranches, simulatedDuration, trancheId])

  return (
    <Box>
      <SimulatedBaseApy
        trancheId={trancheId}
        fixedTermConfigId={fixedTermConfigId}
      />
      <SimulatedBonusApy />
      <SimulatedDefaultEarnings
        yieldEarnings={yieldEarnings}
        setYieldEarnings={setYieldEarnings}
        trancheId={trancheId}
        fixedTermConfigId={fixedTermConfigId}
        simulatedDuration={effectiveDuration}
        isDebouncing={isDebouncing}
        amount={amount}
        amountInUSD={amountInUSD}
      />
      <SimulatedBonusEarnings
        yieldEarnings={yieldEarnings}
        bonusEpochInterest={bonusEpochInterest}
        amount={amount}
        amountInUSD={amountInUSD}
        isDebouncing={isDebouncing}
        simulatedDuration={effectiveDuration}
      />
    </Box>
  )
}

export default memo(SimulatedYieldEarnings)
