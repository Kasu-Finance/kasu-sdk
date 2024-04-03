import { BigNumber } from 'ethers'

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
