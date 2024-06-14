'use client'

import { Connector } from '@web3-react/types'

import {
  getRecentWeb3Connection,
  setRecentWeb3Connection,
} from './connection.helper'
import { getConnection } from './connectors'
import { EIP6963 } from './connectors/eip6963/eip6963.connector'
import { gnosisSafeConnection } from './connectors/gnosisSafeConnector'
import { networkConnection } from './connectors/networkConnector'

import { ConnectionType } from '@/types/connectors'

const connect = async (connector: Connector, type: ConnectionType) => {
  performance.mark(`web3:connect:${type}:start`)

  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly()
    } else {
      await connector.activate()
    }
    return true
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`)
    return false
  } finally {
    performance.measure(`web3:connect:${type}`, `web3:connect:${type}:start`)
  }
}

const connectRecent = () => {
  const recentConnection = getRecentWeb3Connection()

  if (recentConnection?.type && !recentConnection.disconnected) {
    const selectedConnection = getConnection(recentConnection.type)

    if (!selectedConnection) return

    if (selectedConnection.connector instanceof EIP6963) {
      const rdns = recentConnection.rdns

      if (!rdns) return

      selectedConnection.connector.selectProvider(rdns)
    }

    connect(selectedConnection.connector, recentConnection.type)
      .then((connected) => {
        if (!connected) throw new Error()
      })
      .catch((error) => {
        setRecentWeb3Connection(undefined)
        console.error(error)
      })
  }
}

const eagerlyConnect = () => {
  if (typeof window !== 'undefined') {
    // The Safe connector will only work from safe.global, which iframes;
    // it is only necessary to try (and to load all the deps) if we are in an iframe.
    if (window !== window.parent) {
      connect(gnosisSafeConnection.connector, ConnectionType.GNOSIS_SAFE)
    }

    connect(networkConnection.connector, ConnectionType.NETWORK)
    connectRecent()
  }
}

eagerlyConnect()
