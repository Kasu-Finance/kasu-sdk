import { BigNumber, ethers } from 'ethers'

const hexToUSD = (
  hexValue: BigNumber,
  decimals: number = 6,
  rate: number = 1
): string => {
  // Convert the hex string to a BigNumber
  const bigNumberValue = ethers.BigNumber.from(hexValue)

  // Convert the BigNumber to a human-readable format using the specified decimals
  const decimalValue = ethers.utils.formatUnits(bigNumberValue, decimals)

  // Calculate the USD value
  const usdValue = parseFloat(decimalValue) * rate

  return usdValue.toString()
}

export default hexToUSD
