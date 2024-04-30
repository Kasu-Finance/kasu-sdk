import { BigNumber } from 'ethers'

import { UserLendingPortfolio } from '@/components/organisms/portfolio/LendingPortfolioTable'

import { toBigNumber } from '@/utils'

const PORTFOLIO_TOTAL_INITIAL_VALUE = {
  investedAmount: BigNumber.from(0),
  lastEpoch: BigNumber.from(0),
  lastMonth: BigNumber.from(0),
  lastYear: BigNumber.from(0),
  lifeTime: BigNumber.from(0),
}

const useCalculatePortfolioTotal = (
  lendingPortfolio: UserLendingPortfolio[]
) => {
  return lendingPortfolio.reduce((total, cur) => {
    return {
      investedAmount: total.investedAmount.add(
        toBigNumber(cur.totalInvestedAmount)
      ),
      lastEpoch: total.lastEpoch.add(
        toBigNumber(cur.totalYieldEarningsLastEpoch)
      ),
      lastMonth: total.lastMonth.add(
        toBigNumber(cur.totalYieldEarningsLastMonth)
      ),
      lastYear: total.lastYear.add(toBigNumber(cur.totalYieldEarningsLastYear)),
      lifeTime: total.lifeTime.add(toBigNumber(cur.totalYieldEarningsLifetime)),
    }
  }, PORTFOLIO_TOTAL_INITIAL_VALUE)
}

export default useCalculatePortfolioTotal
