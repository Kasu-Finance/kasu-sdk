import { PortfolioLendingPool } from '@solidant/kasu-sdk/src/services/Portfolio/types'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'

import { toBigNumber } from '@/utils'

const useCalculatePortfolioAverage = (
  totalValues: {
    lastEpoch: BigNumber
    lifeTime: BigNumber
    investedAmount: BigNumber
  },
  lendingPortfolio: PortfolioLendingPool[]
) => {
  const totalTranches = lendingPortfolio.reduce((trancheCount, cur) => {
    return trancheCount + cur.tranches.length
  }, 0)

  const weightedApy = lendingPortfolio.reduce((weightedAverage, cur) => {
    const weightedTranchesApy = cur.tranches.reduce(
      (trancheApy, curTranche) =>
        trancheApy.add(
          toBigNumber(curTranche.apy).mul(
            toBigNumber(curTranche.investedAmount)
          )
        ),
      BigNumber.from(0)
    )

    return weightedAverage.add(weightedTranchesApy)
  }, BigNumber.from(0))

  return {
    lastEpoch: totalValues.lastEpoch.div(lendingPortfolio.length),
    lifeTime: totalValues.lifeTime.div(lendingPortfolio.length),
    investedAmount: totalValues.investedAmount.div(totalTranches),
    weightedApy: totalValues.investedAmount.isZero()
      ? '0'
      : formatEther(weightedApy.div(totalValues.investedAmount)),
  }
}

export default useCalculatePortfolioAverage
