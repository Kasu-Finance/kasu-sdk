import { useSendTransaction, useWallets } from '@privy-io/react-auth'
import { BigNumber, ethers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions'

import useToastState from '@/hooks/context/useToastState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { wagmiConfig } from '@/context/privy.provider'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { IERC20__factory } from '@/contracts/output'
import { capitalize, userRejectedTransaction } from '@/utils'
import { wrapQueuedProvider } from '@/utils/rpc/rpcQueue'
import isPrivyEmbeddedWallet from '@/utils/web3/isPrivyEmbeddedWallet'

const useApproveToken = (
  tokenAddress: `0x${string}` | undefined,
  spender: `0x${string}` | undefined,
  amount: string
) => {
  const { address } = usePrivyAuthenticated()

  const { decimals } = useTokenDetails(tokenAddress)

  const { wallets } = useWallets()

  const { sendTransaction } = useSendTransaction()

  const activeWallet = wallets.find(
    (wallet) => wallet.address.toLowerCase() === address?.toLowerCase()
  )

  const shouldSponsor = isPrivyEmbeddedWallet(activeWallet)

  const [isApproved, setIsApproved] = useState(false)

  const { setToast, removeToast } = useToastState()

  const { data: allowance, mutate } = useSWR(
    address && tokenAddress && spender
      ? [
          `allowance-${tokenAddress}-${spender}-${address}`,
          tokenAddress,
          address,
          spender,
        ]
      : null,
    async ([_, token, userAddress, spender]) => {
      const allowance = await readContract(wagmiConfig, {
        address: token,
        abi: IERC20__factory.abi,
        functionName: 'allowance',
        args: [userAddress, spender],
      })

      return BigNumber.from(allowance)
    },
    {
      fallbackData: parseEther('0'),
    }
  )

  useEffect(() => {
    if (!allowance || allowance.isZero()) {
      setIsApproved(false)
      return
    }

    if (allowance.gte(parseUnits(amount || '0', decimals))) {
      setIsApproved(true)
      return
    }

    setIsApproved(false)
  }, [allowance, amount, decimals])

  const approve = async (
    approveAmount: string,
    options?: {
      suppressToast?: boolean
      onError?: (status: 'cancelled' | 'error', error?: unknown) => void
      onStatus?: (status: 'signing' | 'confirming') => void
    }
  ): Promise<boolean> => {
    const shouldToast = !options?.suppressToast

    try {
      if (!tokenAddress)
        throw new Error('useApproveToken: tokenAddress not specified')
      if (!spender) throw new Error('useApproveToken: spender not specified')

      if (shouldToast) {
        setToast({
          type: 'info',
          title: capitalize(ActionStatus.PROCESSING),
          message: ACTION_MESSAGES[ActionType.APPROVE][ActionStatus.PROCESSING],
          isClosable: false,
        })
      }

      options?.onStatus?.('signing')

      let hash: `0x${string}`

      if (shouldSponsor && activeWallet) {
        const privyProvider = wrapQueuedProvider(
          await activeWallet.getEthereumProvider(),
          {
            sponsorTransactions: true,
            sendTransaction,
            sendTransactionAddress: activeWallet.address,
          }
        )
        if (!privyProvider) {
          throw new Error('useApproveToken: wallet provider not available')
        }

        const provider = new ethers.providers.Web3Provider(privyProvider)
        const signer = provider.getSigner(activeWallet.address)
        const tokenContract = IERC20__factory.connect(tokenAddress, signer)
        const tx = await tokenContract.approve(
          spender,
          parseUnits(approveAmount, decimals)
        )
        hash = tx.hash as `0x${string}`
      } else {
        hash = await writeContract(wagmiConfig, {
          abi: IERC20__factory.abi,
          address: tokenAddress,
          functionName: 'approve',
          args: [spender, parseUnits(approveAmount, decimals).toBigInt()],
        })
      }

      options?.onStatus?.('confirming')

      await waitForTransactionReceipt(wagmiConfig, { hash })

      await mutate()

      if (shouldToast) {
        removeToast()
      }
      setIsApproved(true)
      return true
    } catch (error) {
      const status = userRejectedTransaction(error) ? 'cancelled' : 'error'
      options?.onError?.(status, error)

      if (!shouldToast) {
        console.error(error)
        return false
      }

      let title: string, message: string

      if (status === 'cancelled') {
        message = ACTION_MESSAGES[ActionStatus.REJECTED]
        title = capitalize(`${ActionType.APPROVE} ${ActionStatus.REJECTED}`)
      } else {
        message = ACTION_MESSAGES[ActionType.APPROVE][ActionStatus.ERROR]
        title = capitalize(`${ActionType.APPROVE} ${ActionStatus.ERROR}`)
      }

      setToast({
        type: 'error',
        title,
        message,
      })
      return false
    }
  }

  return { isApproved, approve, mutate }
}

export default useApproveToken
