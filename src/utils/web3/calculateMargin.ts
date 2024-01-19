import { BigNumber } from 'ethers'

const calculateMargin = (value: BigNumber) =>
  value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000))

export default calculateMargin
