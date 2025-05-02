import { ProviderRpcError } from '@web3-react/types'
import { useCallback } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import { ErrorCode } from '@/constants'
import { userRejectedConnection, web3reactError } from '@/utils'

import { Connection } from '@/types/connectors'

const useWalletActivation = () => {
  const { modal, closeModal } = useModalState()

  const { setToast, removeToast } = useToastState()

  const handleError = useHandleError()

  // const connection = getConnection(connector)

  const tryActivation = useCallback(
    async (connection: Connection) => {
      try {
        // setToast({
        //   type: 'info',
        //   title: 'Connecting Wallet',
        //   message: 'We are connecting your wallet...',
        // })
        // if (connection.overrideActivate?.()) return
        // await connection.connector.activate()
        // modal.connectWalletModal.callback?.()
      } catch (error) {
        if (
          (error as ProviderRpcError)?.code === ErrorCode.MM_ALREADY_PENDING
        ) {
          setToast({
            type: 'info',
            title: 'Connecting Wallet',
            message: 'Wallet connection already pending...',
          })
          return
        }
        // Ideally set to setError global context.
        web3reactError(error as Error)
        if (userRejectedConnection(connection, error)) {
          setToast({
            type: 'error',
            title: 'Connection Error',
            message: 'Wallet connection request rejected.',
          })
          return
        }

        handleError(error)
      }
    },
    // eslint-disable-next-line
    []
  )

  const disconnect = useCallback(() => {
    // if (connector && connector.deactivate) {
    //   connector.deactivate()
    // }
    // connector.resetState()
    // setRecentWeb3ConnectionDisconnected()
  }, [])

  // useEffect(() => {
  //   if (account || ENSName) {
  //     setRecentWeb3Connection({
  //       type: connection.type,
  //       address: account,
  //       disconnected: false,
  //       ENSName: ENSName ?? undefined,
  //       rdns: connection.getProviderInfo().rdns,
  //     })
  //   }
  // }, [ENSName, account, connection])

  // useEffect(() => {
  //   if (account) {
  //     closeModal(ModalsKeys.CONNECT_WALLET)
  //     removeToast()
  //   }
  // }, [account, closeModal, removeToast])

  return {
    tryActivation,
    disconnect,
  }
}

export default useWalletActivation
