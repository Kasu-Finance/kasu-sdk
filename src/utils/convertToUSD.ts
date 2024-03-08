import { BigNumber } from 'ethers'

import { toBigNumber } from '@/utils'

const convertToUSD = (amount: BigNumber, price: BigNumber) => {
  if (amount.isZero() || price.isZero()) return BigNumber.from(0)

  return amount.mul(price).div(toBigNumber('1'))
}

export default convertToUSD
