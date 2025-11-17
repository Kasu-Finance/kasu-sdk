import { PortfolioLendingPool } from '@kasufinance/kasu-sdk/src/services/Portfolio/types'
import { BigNumber } from 'ethers'

import { toBigNumber } from '@/utils'

const PORTFOLIO_TOTAL_INITIAL_VALUE = {
  investedAmount: BigNumber.from(0),
  lastEpoch: BigNumber.from(0),
  lifeTime: BigNumber.from(0),
}

const useCalculatePortfolioTotal = (
  lendingPortfolio: PortfolioLendingPool[]
) => {
  return lendingPortfolio.reduce((total, cur) => {
    return {
      investedAmount: total.investedAmount
        .add(toBigNumber(cur.totalInvestedAmount))
        .div(toBigNumber('1')),
      lastEpoch: total.lastEpoch.add(
        toBigNumber(cur.totalYieldEarningsLastEpoch)
      ),
      lifeTime: total.lifeTime.add(toBigNumber(cur.totalYieldEarningsLifetime)),
    }
  }, PORTFOLIO_TOTAL_INITIAL_VALUE)
}

export default useCalculatePortfolioTotal
