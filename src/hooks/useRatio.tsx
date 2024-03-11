import { toBigNumber } from '@/utils'

const useRatio = (numerator: string | number, denominator: string | number) => {
  return toBigNumber(numerator.toString())
    .mul(toBigNumber('1'))
    .div(toBigNumber(denominator.toString()))
}

export default useRatio
