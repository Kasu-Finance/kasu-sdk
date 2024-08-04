import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'

import {
  setRecentWeb3Connection,
  setRecentWeb3ConnectionDisconnected,
} from '@/connection/connection.helper'
import { getConnection } from '@/connection/connectors'
import { userRejectedConnection, web3reactError } from '@/utils'

import { Connection } from '@/types/connectors'

interface LoadingState {
  [key: string]: boolean
}

const useWalletActivation = () => {
  const { chainId, account, connector, ENSName } = useWeb3React()

  const { modal } = useModalState()

  const [loading, setLoading] = useState<LoadingState>({})

  const connection = getConnection(connector)

  const tryActivation = useCallback(
    async (connection: Connection, callback: () => void) => {
      const providerName = connection.getProviderInfo().name

      try {
        setLoading((prev) => ({ ...prev, [providerName]: true }))
        if (connection.overrideActivate?.()) return

        await connection.connector.activate()

        modal.connectWalletModal.callback?.()
      } catch (error) {
        // Ideally set to setError global context.
        web3reactError(error as Error)

        if (userRejectedConnection(connection, error)) {
          console.warn('user rejected')
        }
      } finally {
        setLoading((prev) => ({ ...prev, [providerName]: false }))
        callback()
      }
    },
    // eslint-disable-next-line
    [chainId]
  )

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

  return {
    isProviderLoading: loading,
    tryActivation,
    disconnect,
  }
}

export default useWalletActivation
