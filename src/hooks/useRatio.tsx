import { BigNumber } from 'ethers'

import { toBigNumber } from '@/utils'

const useRatio = (numerator: string | number, denominator: string | number) => {
  const numeratorBn = toBigNumber(numerator.toString())
  const denominatorBn = toBigNumber(denominator.toString())

  if (numeratorBn.isZero() || denominatorBn.isZero()) return BigNumber.from(0)

  return numeratorBn.mul(toBigNumber('1')).div(denominatorBn)
}

export default useRatio
