import { BigNumber } from 'ethers'

import { toBigNumber } from '@/utils'

const convertFromUSD = (amount: BigNumber, price: BigNumber) => {
  if (amount.isZero() || price.isZero()) return BigNumber.from(0)

  return amount.mul(toBigNumber('1')).div(price)
}

export default convertFromUSD
