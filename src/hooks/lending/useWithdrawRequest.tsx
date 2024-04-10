import { useWeb3React } from '@web3-react/core'
import { BigNumberish, ContractTransaction } from 'ethers'
import { useState } from 'react'

import useToastState from '@/hooks/context/useToastState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useGenerateKycSignature from '@/hooks/web3/useGenerateKycSignature'
import useHandleError from '@/hooks/web3/useHandleError'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useWithdrawRequest = () => {
  const sdk = useKasuSDK()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<ContractTransaction | null>(null)

  const { account } = useWeb3React()
  const handleError = useHandleError()
  const { kycData } = useGenerateKycSignature()
  const { setToast, removeToast } = useToastState()

  const requestWithdrawal = async (
    lendingPool: string,
    tranche: string,
    amount: BigNumberish,
    options?: { isWithdrawMax: boolean }
  ) => {
    if (!account) {
      handleError(
        'Account is undefined',
        `${ActionType.WITHDRAW} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.WITHDRAW][ActionStatus.ERROR]
      )
      return console.error('RequestWithdraw:: Account is undefined')
    }

    setIsLoading(true)
    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      if (!kycData) {
        throw new Error('RequestWithdrawal:: Error generating signature')
      }

      let txResponse
      if (options?.isWithdrawMax) {
        txResponse = await sdk.UserLending.requestWithdrawalMax(
          lendingPool,
          tranche,
          account
        )
      } else {
        txResponse = await sdk.UserLending.requestWithdrawalInUSDC(
          lendingPool,
          tranche,
          amount
        )
      }

      await waitForReceipt(txResponse)
      setData(txResponse)
      removeToast()

      return txResponse
    } catch (error) {
      console.error('Failed to request withdrawal:', error)
      setData(null)
      handleError(
        error,
        `${ActionType.WITHDRAW} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.WITHDRAW][ActionStatus.ERROR]
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { requestWithdrawal, isLoading, data }
}

export default useWithdrawRequest
