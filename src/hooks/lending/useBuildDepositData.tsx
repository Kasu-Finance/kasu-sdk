import { ethers } from 'ethers'

const additionalDepositDataTypes = ['bytes', 'uint256']

const useBuildDepositData = () => {
  return (signature: string, timestamp: EpochTimeStamp) => {
    const encodedAdditionalDepositData = ethers.utils.defaultAbiCoder.encode(
      additionalDepositDataTypes,
      [signature, timestamp]
    )

    return encodedAdditionalDepositData
  }
}

export default useBuildDepositData
