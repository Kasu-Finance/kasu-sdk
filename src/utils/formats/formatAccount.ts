import { ethers } from 'ethers'

const formatAccount = (address: string | undefined): string | undefined => {
  if (!address) return

  const account = address || ethers.constants.AddressZero

  return `${account.slice(0, 6)}...${account.slice(-4)}`
}

export default formatAccount
