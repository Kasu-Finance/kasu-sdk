'use client'

import { Box, Modal } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect } from 'react'

import { useOrderedConnections } from '@/hooks/web3/useOrderedConnections'
import useSwitchChain from '@/hooks/web3/useSwitchChain'

import { SupportedChainIds } from '@/connection/chains'
import {
  setRecentWeb3Connection,
  setRecentWeb3ConnectionDisconnected,
} from '@/connection/connection.helper'
import { getConnection } from '@/connection/connectors'
import { networkConnection } from '@/connection/connectors/networkConnector'
import useModalState from '@/context/modal/useModalState'
import { didUserReject, formatAccount, web3reactError } from '@/utils'

import { Connection } from '@/types/connectors'

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
}

const ConnectWalletModal: React.FC = () => {
  const connections = useOrderedConnections()

  const { chainId, account, connector, ENSName } = useWeb3React()

  const connection = getConnection(connector)

  const { modal, closeModal } = useModalState()

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
          console.warn('user rejected')
        }
      }
    },
    // eslint-disable-next-line
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
      console.warn(error)
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

  const handleClose = () => closeModal('connectWalletModal')

  return (
    <Modal
      open={modal['connectWalletModal'].isOpen}
      onClose={handleClose}
      aria-labelledby='Connect Wallet Modal'
      aria-describedby='List of available web3 wallet connections'
      slotProps={{
        backdrop: {
          color: 'red',
        },
      }}
    >
      <Box sx={style}>
        <div>Connector : {getConnection(connector).getProviderInfo().name}</div>
        <div>Account : {formatAccount(account) ?? 'not connected'}</div>
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
      </Box>
    </Modal>
  )
}

export default ConnectWalletModal
