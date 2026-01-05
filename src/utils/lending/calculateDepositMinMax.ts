import { PoolOverview } from '@kasufinance/kasu-sdk/src/services/DataService/types'
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
  const trancheCapacity = toBigNumber(tranche?.poolCapacity ?? '0')
  const defaultMinDeposit = toBigNumber('1')

  if (trancheMin.lt(defaultMinDeposit)) {
    trancheMin = defaultMinDeposit
  }

  const currentEpochDepositedAmount = currentEpochDepositedAmountMap.get(
    trancheId.toLowerCase()
  )
  const currentEpochFtdAmount =
    currentEpochFtdAmountMap.get(trancheId.toLowerCase()) ?? []

  const currentDepositedAmount = toBigNumber(currentEpochDepositedAmount ?? '0')
  let epochMaxDeposit = trancheMax

  if (!currentDepositedAmount.isZero()) {
    const ftdDepositedAmount =
      currentEpochFtdAmount[parseFloat(fixedTermConfigId ?? '0')]

    if (ftdDepositedAmount) {
      trancheMin = defaultMinDeposit
    }
    trancheMax = currentDepositedAmount.gte(trancheMax)
      ? toBigNumber('0')
      : trancheMax.sub(currentDepositedAmount)
    epochMaxDeposit = trancheMax
  }

  if (trancheMax.gt(trancheCapacity)) {
    trancheMax = trancheCapacity
  }

  return {
    minDeposit: formatEther(trancheMin),
    maxDeposit: formatEther(trancheMax),
    remainingCapacity: formatEther(trancheCapacity),
    epochMaxDeposit: formatEther(epochMaxDeposit),
  }
}

export default calculateDepositMinMax
