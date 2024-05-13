import { useWeb3React } from '@web3-react/core'
import { ProviderRpcError } from '@web3-react/types'
import { useCallback } from 'react'

import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { ErrorCode } from '@/constants'

const useSwitchChain = () => {
  const { connector } = useWeb3React()

  return useCallback(
    async (chainId: SupportedChainIds) => {
      if (!connector) return

      try {
        await connector.activate(chainId)
      } catch (error) {
        const errorCode =
          (error as any).data?.originalError?.code ||
          (error as ProviderRpcError).code

        if (errorCode === ErrorCode.CHAIN_NOT_ADDED) {
          // label cannot be present ( look at AddEthereumChainParameter type )
          delete networks[chainId].label

          await connector.activate(networks[chainId])
        }
      }
    },
    [connector]
  )
}

export default useSwitchChain
