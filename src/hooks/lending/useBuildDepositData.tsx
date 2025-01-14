import { ethers } from 'ethers'

const additionalDepositDataTypes = ['bytes', 'uint256', 'uint256']

const useBuildDepositData = () => {
  return (
    signature: string,
    timestamp: EpochTimeStamp,
    versionType: number
  ) => {
    const encodedAdditionalDepositData = ethers.utils.defaultAbiCoder.encode(
      additionalDepositDataTypes,
      [signature, timestamp, versionType]
    )

    return encodedAdditionalDepositData
  }
}

export default useBuildDepositData
