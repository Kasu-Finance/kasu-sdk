import { BigNumber, ethers } from 'ethers'

import { ZERO_ADDRESS } from '@/constants/pool'

interface Tranche {
  id: string
}

interface TrancheWithUserBalance extends Tranche {
  yieldEarned: number
  apy: string
  name: string
  balance?: BigNumber
}

export const getTranchesWithUserBalances = (
  tranches: Tranche[],
  balances: any[]
): TrancheWithUserBalance[] => {
  return tranches.map((tranche) => {
    const balance = balances.find((b) => b.address === tranche.id)

    if (!balance) {
      return tranche as TrancheWithUserBalance
    }

    return {
      ...tranche,
      ...balance,
      yieldEarned: balance.yieldEarned ?? 0,
    }
  })
}

export const calculateTotalYieldEarned = (
  tranches: TrancheWithUserBalance[]
) => {
  return tranches.reduce((total, tranche) => {
    if (tranche.yieldEarned) {
      return total + tranche.yieldEarned
    }

    return total
  }, 0)
}

export const calculateTotalInvested = (tranches: TrancheWithUserBalance[]) => {
  return tranches.reduce((total, tranche) => {
    // Check if balance exists and is a BigNumber
    if (tranche.balance && BigNumber.isBigNumber(tranche.balance)) {
      // Convert hex balance to a BigNumber and add to total
      const balanceBigNumber = ethers.BigNumber.from(tranche.balance._hex)
      return total.add(balanceBigNumber)
    }

    return total
  }, ethers.BigNumber.from(ZERO_ADDRESS))
}
