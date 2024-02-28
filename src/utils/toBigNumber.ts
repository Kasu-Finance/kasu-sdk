import { BigNumber, BigNumberish, parseFixed } from '@ethersproject/bignumber'

const toBigNumber = (value: string, decimalPlaces: BigNumberish = 18) => {
  if (!value) {
    return BigNumber.from(0)
  }

  if (!value.includes('.')) {
    return parseFixed(value, decimalPlaces)
  }

  const parts = value.split('.')
  const fraction = parts[1].slice(0, Number(decimalPlaces))

  return parseFixed(`${parts[0]}.${fraction}`, decimalPlaces)
}

export default toBigNumber
