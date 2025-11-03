import { BigNumber, ethers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'
import {
  estimateGas,
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

const useApproveToken = (
  tokenAddress: `0x${string}` | undefined,
  spender: `0x${string}` | undefined,
  amount: string
) => {
  const { address } = usePrivyAuthenticated()

  const { decimals } = useTokenDetails(tokenAddress)

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

  const approve = async (approveAmount: string) => {
    try {
      if (!tokenAddress)
        throw new Error('useApproveToken: tokenAddress not specified')
      if (!spender) throw new Error('useApproveToken: spender not specified')

      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message: ACTION_MESSAGES[ActionType.APPROVE][ActionStatus.PROCESSING],
        isClosable: false,
      })

      let useExact = false

      let estimatedGasTest: bigint

      try {
        estimatedGasTest = await estimateGas(wagmiConfig, {
          to: tokenAddress,
          data: encodeFunctionData({
            abi: IERC20__factory.abi,
            functionName: 'approve',
            args: [spender, ethers.constants.MaxUint256.toBigInt()],
          }),
        })
      } catch (error) {
        useExact = true

        estimatedGasTest = await estimateGas(wagmiConfig, {
          to: tokenAddress,
          data: encodeFunctionData({
            abi: IERC20__factory.abi,
            functionName: 'approve',
            args: [spender, parseUnits(approveAmount, decimals).toBigInt()],
          }),
        })
      }

      const hash = await writeContract(wagmiConfig, {
        abi: IERC20__factory.abi,
        address: tokenAddress,
        functionName: 'approve',
        args: [
          spender,
          useExact
            ? parseUnits(approveAmount, decimals).toBigInt()
            : ethers.constants.MaxUint256.toBigInt(),
        ],
        gas: estimatedGasTest,
      })

      await waitForTransactionReceipt(wagmiConfig, { hash })

      await mutate()

      removeToast()
      setIsApproved(true)
    } catch (error) {
      let title: string, message: string

      if (userRejectedTransaction(error)) {
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
    }
  }

  return { isApproved, approve, mutate }
}

export default useApproveToken
