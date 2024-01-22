import { ErrorCode } from '@/constants'
import userRejectedTransaction from '@/utils/web3/userRejectedTransaction'

import { Connection, ConnectionType } from '@/types/connectors'

const userRejectedConnection = (
  connection: Connection,
  error: any
): boolean => {
  return (
    userRejectedTransaction(error) ||
    (connection.type === ConnectionType.WALLET_CONNECT_V2 &&
      error?.toString?.() === ErrorCode.WC_V2_MODAL_CLOSED) ||
    (connection.type === ConnectionType.COINBASE_WALLET &&
      error?.toString?.() === ErrorCode.CB_REJECTED_REQUEST)
  )
}

export default userRejectedConnection
