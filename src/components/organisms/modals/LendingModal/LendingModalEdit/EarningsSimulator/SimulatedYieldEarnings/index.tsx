import { Box } from '@mui/material'
import React, { memo, useState } from 'react'

import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'

import SimulatedBaseApy from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBaseApy'
import SimulatedBonusApy from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBonusApy'
import SimulatedBonusEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBonusEarnings'
import SimulatedDefaultEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedDefaultEarnings'

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
  const [yieldEarnings, setYieldEarnings] = useState([0])

  const bonusEpochInterest = getBonusEpochInterest(currentLevel)

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
        simulatedDuration={simulatedDuration}
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
        simulatedDuration={simulatedDuration}
      />
    </Box>
  )
}

export default memo(SimulatedYieldEarnings)
