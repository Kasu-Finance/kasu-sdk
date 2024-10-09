import { ContractTransaction } from 'ethers'

export enum ErrorCode {
  USER_REJECTED_REQUEST = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,
  // https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
  CHAIN_NOT_ADDED = 4902,
  MM_ALREADY_PENDING = -32002,
  WC_V2_MODAL_CLOSED = 'Error: Connection request reset. Please try again.',
  WC_MODAL_CLOSED = 'Error: User closed modal',
  CB_REJECTED_REQUEST = 'Error: User denied account authorization',
}

export enum ErrorTypes {
  TRANSACTION_REVERTED = 'Transaction Reverted',
  INSUFFICIENT_BALANCE = 'Insufficient Balance',
  TRANSACTION_REPLACED = 'Transaction Replaced',
  UNEXPECTED_ERROR = 'Unexpected Error',
}

export const ERROR_MESSAGES = {
  [ErrorTypes.TRANSACTION_REVERTED]: 'Check log for more details',
  [ErrorTypes.INSUFFICIENT_BALANCE]: 'Check log for more details',
  [ErrorTypes.UNEXPECTED_ERROR]: 'Check log for more details',
} as const

export class TransactionError extends Error {
  public transaction: ContractTransaction

  constructor(
    transaction: ContractTransaction,
    code?: string,
    message?: string,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.transaction = transaction

    this.name = code ?? this.constructor.name
  }
}
