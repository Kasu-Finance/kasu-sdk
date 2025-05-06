export const connections = [
  // gnosisSafeConnection,
  // deprecatedInjectedConnection,
  // walletConnectConnection,
  // coinbaseWalletConnection,
  // eip6963Connection,
  // networkConnection,
]

export function getConnection() {
  // if (connector instanceof Connector) {
  //   const connection = connections.find(
  //     (connection) => connection.connector === connector
  //   )
  //   if (!connection) {
  //     throw Error('unsupported connector')
  //   }
  //   return connection
  // } else {
  //   switch (connector) {
  //     case ConnectionType.INJECTED:
  //       return deprecatedInjectedConnection
  //     case ConnectionType.COINBASE_WALLET:
  //       return coinbaseWalletConnection
  //     case ConnectionType.WALLET_CONNECT_V2:
  //       return walletConnectConnection
  //     case ConnectionType.NETWORK:
  //       return networkConnection
  //     case ConnectionType.GNOSIS_SAFE:
  //       return gnosisSafeConnection
  //     case ConnectionType.EIP_6963_INJECTED:
  //       return eip6963Connection
  //   }
  // }
}
