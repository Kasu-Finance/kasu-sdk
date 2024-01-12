'use client'

import { useWeb3React } from '@web3-react/core'
import { ReactNode, useCallback, useEffect } from 'react'

import { useOrderedConnections } from '@/hooks/web3/useOrderedConnections'
import useSwitchChain from '@/hooks/web3/useSwitchChain'

import Modal from '@/components/atoms/Modal'

import { SupportedChainIds } from '@/connection/chains'
import {
  setRecentWeb3Connection,
  setRecentWeb3ConnectionDisconnected,
} from '@/connection/connection.helper'
import { getConnection } from '@/connection/connectors'
import { networkConnection } from '@/connection/connectors/networkConnector'
import { didUserReject, web3reactError } from '@/utils'

import { Connection } from '@/types/connectors'

type ConnectWalletModalProps = {
  trigger: ReactNode
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ trigger }) => {
  const connections = useOrderedConnections()

  const { chainId, account, connector, ENSName } = useWeb3React()

  const connection = getConnection(connector)

  const switchChain = useSwitchChain()

  const tryActivation = useCallback(
    async (connection: Connection) => {
      try {
        if (connection.overrideActivate?.()) return

        await connection.connector.activate()
      } catch (error) {
        // Ideally set to setError global context.
        web3reactError(error as Error)

        if (didUserReject(connection, error)) {
          console.log('user rejected')
        }
      }
    },
    [chainId]
  )

  const selectChain = async () => {
    try {
      await switchChain(
        chainId === SupportedChainIds.MAINNET
          ? SupportedChainIds.ARBITRUM_ONE
          : SupportedChainIds.MAINNET
      )
    } catch (error) {
      console.log(error)
    }
  }

  const disconnect = useCallback(() => {
    if (connector && connector.deactivate) {
      connector.deactivate()
    }
    connector.resetState()

    setRecentWeb3ConnectionDisconnected()
  }, [connector])

  useEffect(() => {
    if (account || ENSName) {
      setRecentWeb3Connection({
        type: connection.type,
        address: account,
        disconnected: false,
        ENSName: ENSName ?? undefined,
        rdns: connection.getProviderInfo().rdns,
      })
    }
  }, [ENSName, account, connection])

  return (
    <Modal trigger={trigger}>
      <div>Connector : {getConnection(connector).getProviderInfo().name}</div>
      <div>Account : {account ?? 'not connected'}</div>
      <div>ChainID : {chainId ?? 'not connected'}</div>
      {connections.orderedConnections.map((connection) => {
        return (
          <div
            key={connection.getProviderInfo().name}
            onClick={() => tryActivation(connection)}
          >
            {connection.getProviderInfo().name}
          </div>
        )
      })}
      <button onClick={selectChain}>switch chain</button>
      {connector !== networkConnection.connector && (
        <button onClick={disconnect}>disconnect</button>
      )}
    </Modal>
  )
}

export default ConnectWalletModal
