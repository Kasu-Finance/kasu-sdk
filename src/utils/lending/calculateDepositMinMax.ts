import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { formatEther } from 'ethers/lib/utils'

import toBigNumber from '@/utils/toBigNumber'

const calculateDepositMinMax = (
  tranches: PoolOverview['tranches'],
  trancheId: `0x${string}`,
  currentEpochDepositedAmountMap: Map<string, string>,
  currentEpochFtdAmountMap: Map<string, string[]>,
  fixedTermConfigId?: string
) => {
  let tranche = tranches.find((t) => t.id === trancheId)

  // If the tranche is not found by ID, fall back to names
  if (!tranche) {
    const tranchePriority = ['senior', 'mezzanine', 'junior']
    for (const name of tranchePriority) {
      tranche = tranches.find((t) => t.name.toLowerCase().includes(name))
      if (tranche) break
    }
  }

  let trancheMin = toBigNumber(tranche?.minimumDeposit ?? '0')
  let trancheMax = toBigNumber(tranche?.maximumDeposit ?? '0')

  const currentEpochDepositedAmount = currentEpochDepositedAmountMap.get(
    trancheId.toLowerCase()
  )
  const currentEpochFtdAmount =
    currentEpochFtdAmountMap.get(trancheId.toLowerCase()) ?? []

  const currentDepositedAmount = toBigNumber(currentEpochDepositedAmount ?? '0')

  // if user has deposited once in this epoch, they already have deposited the minimum requirement
  // and such, the max amount he can deposit into this epoch
  // should reflect/subtracted from his previous deposits in the same epoch
  if (!currentDepositedAmount.isZero()) {
    const ftdDepositedAmount =
      currentEpochFtdAmount[parseFloat(fixedTermConfigId ?? '0')]

    if (ftdDepositedAmount) {
      trancheMin = toBigNumber('1')
    }
    trancheMax = trancheMax.sub(currentDepositedAmount)
  }

  return {
    minDeposit: formatEther(trancheMin),
    maxDeposit: formatEther(trancheMax),
  }
}

export default calculateDepositMinMax
