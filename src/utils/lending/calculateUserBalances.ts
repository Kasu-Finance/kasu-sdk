import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'
import { UserTrancheBalance } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { BigNumber, ethers } from 'ethers'

import hexToUSD from '@/utils/hexToUSD'

interface Tranche {
  id: string
}

export interface TrancheWithUserBalance extends Tranche {
  yieldEarned: number
  apy: string
  name: string
  balance?: BigNumber
}

export const calculateUserLendingSummary = (
  trancheBalances: (TrancheData & {
    balanceData: UserTrancheBalance
  })[]
) => {
  return trancheBalances.reduce(
    (acc, cur) => {
      acc.totalYieldEarned += acc.totalYieldEarned + cur.balanceData.yieldEarned

      acc.totalInvested = acc.totalInvested.add(cur.balanceData.balance)

      acc.averageApy += parseFloat(cur.apy) * parseInt(cur.poolCapacity)

      return acc
    },
    { totalInvested: ethers.constants.Zero, totalYieldEarned: 0, averageApy: 0 }
  )
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

export const calculateTotalInvested = (
  tranches: TrancheWithUserBalance[],
  decimal: number = 6
): string => {
  const tot = tranches.reduce((total, tranche) => {
    // Check if balance exists and is a BigNumber
    if (tranche.balance && BigNumber.isBigNumber(tranche.balance)) {
      // Convert hex balance to a BigNumber and add to total
      const balanceBigNumber = BigNumber.from(tranche.balance)
      return total.add(balanceBigNumber)
    }

    return total
  }, BigNumber.from('0x00'))

  return hexToUSD(tot, decimal)
}

export const hexToBigNumber = (hex: string) => {
  return BigNumber.from(hex)
}
