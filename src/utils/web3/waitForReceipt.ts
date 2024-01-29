import { ContractTransaction } from 'ethers'

import { TransactionError } from '@/constants'

const waitForReceipt = async (transaction: ContractTransaction) => {
  try {
    const receipt = await transaction.wait()

    return receipt
  } catch (_error) {
    const error = _error as any

    throw new TransactionError(
      transaction,
      error?.code,
      error?.message,
      error?.options
    )
  }
}

export default waitForReceipt
