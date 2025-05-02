import { useWallets } from '@privy-io/react-auth'
import { ProviderRpcError } from '@web3-react/types'
import { useCallback } from 'react'

import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { ErrorCode } from '@/constants'

const useSwitchChain = () => {
  const handleError = useHandleError()

  const { setToast } = useToastState()

  const { wallets } = useWallets()

  const wallet = wallets[0]

  return useCallback(
    async (chainId: SupportedChainIds) => {
      // if (!connector) return

      try {
        setToast({
          title: 'Wrong Chain',
          message: 'Please switch to the correct chain.',
          type: 'info',
          isClosable: false,
        })

        // await connector.activate(chainId)

        await wallet.switchChain(chainId)

        return true
      } catch (error) {
        const errorCode =
          (error as any).data?.originalError?.code ||
          (error as ProviderRpcError).code

        if (errorCode === ErrorCode.CHAIN_NOT_ADDED) {
          // label cannot be present ( look at AddEthereumChainParameter type )
          delete networks[chainId].label

          // await connector.activate(networks[chainId])

          return true
          // } else if (userRejectedConnection(getConnection(connector), error)) {
          //   handleError(
          //     error,
          //     'Connection Error',
          //     'Chain switching request denied.',
          //     true
          //   )
        } else {
          handleError(error)
        }
      }
    },
    [handleError, setToast]
  )
}

export default useSwitchChain
