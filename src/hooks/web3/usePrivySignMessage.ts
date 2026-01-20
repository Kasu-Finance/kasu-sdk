import { useWallets } from '@privy-io/react-auth'
import { useCallback } from 'react'
import { toHex } from 'viem'
import { useSignMessage } from 'wagmi'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import isPrivyEmbeddedWallet from '@/utils/web3/isPrivyEmbeddedWallet'

type SignMessageArgs = {
  message: string
}

type SignMessageOptions = {
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
}

/**
 * Custom sign message hook that uses Privy's native signing for embedded wallets
 * to avoid browser crashes, and falls back to wagmi's useSignMessage for external wallets.
 *
 * For embedded wallets, we use the provider's personal_sign method directly
 * to avoid chain-switching issues that occur with wallet.sign().
 */
const usePrivySignMessage = () => {
  const { address } = usePrivyAuthenticated()
  const { wallets } = useWallets()
  const { signMessage: wagmiSignMessage } = useSignMessage()

  const wallet = wallets.find((w) => w.address === address)
  const isEmbedded = isPrivyEmbeddedWallet(wallet)

  const signMessage = useCallback(
    (args: SignMessageArgs, options?: SignMessageOptions) => {
      const { message } = args
      const { onSuccess, onError } = options || {}

      if (isEmbedded && wallet) {
        // Use provider's personal_sign directly to avoid chain-switching issues
        wallet
          .getEthereumProvider()
          .then((provider) => {
            // Convert message to hex for personal_sign
            const messageHex = toHex(message)
            return provider.request({
              method: 'personal_sign',
              params: [messageHex, wallet.address],
            })
          })
          .then((signature) => {
            onSuccess?.(signature as string)
          })
          .catch((error) => {
            onError?.(error instanceof Error ? error : new Error(String(error)))
          })
      } else {
        // Use wagmi's signMessage for external wallets
        wagmiSignMessage(
          { message },
          {
            onSuccess,
            onError,
          }
        )
      }
    },
    [isEmbedded, wallet, wagmiSignMessage]
  )

  return { signMessage }
}

export default usePrivySignMessage
