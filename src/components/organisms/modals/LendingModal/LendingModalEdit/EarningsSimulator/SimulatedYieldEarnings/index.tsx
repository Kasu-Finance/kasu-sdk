import { Box } from '@mui/material'
import { useState } from 'react'

import useLoyaltyLevel, { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import SimulatedBaseApy from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBaseApy'
import SimulatedBonusApy from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBonusApy'
import SimulatedBonusEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedBonusEarnings'
import SimulatedDefaultEarnings from '@/components/organisms/modals/LendingModal/LendingModalEdit/EarningsSimulator/SimulatedYieldEarnings/SimulatedDefaultEarnings'

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

const SimulatedYieldEarnings = () => {
  const [yieldEarnings, setYieldEarnings] = useState([0])

  const { stakedPercentage } = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  const bonusEpochInterest = getBonusEpochInterest(currentLevel)

  return (
    <Box>
      <SimulatedBaseApy />
      <SimulatedBonusApy />
      <SimulatedDefaultEarnings
        yieldEarnings={yieldEarnings}
        setYieldEarnings={setYieldEarnings}
      />
      <SimulatedBonusEarnings
        yieldEarnings={yieldEarnings}
        bonusEpochInterest={bonusEpochInterest}
      />
    </Box>
  )
}

export default SimulatedYieldEarnings
