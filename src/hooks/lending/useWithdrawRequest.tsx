import { useWeb3React } from '@web3-react/core'
import { BigNumberish, ContractTransaction } from 'ethers'
import { useState } from 'react'

import useToastState from '@/hooks/context/useToastState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import generateKycSignature from '@/actions/generateKycSignature'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

import { HexString } from '@/types/lending'

const useWithdrawRequest = () => {
  const sdk = useKasuSDK()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<ContractTransaction | null>(null)

  const { account, chainId } = useWeb3React()
  const { setToast, removeToast } = useToastState()
  const handleError = useHandleError()

  const requestWithdrawal = async (
    lendingPool: string,
    tranche: string,
    amount: BigNumberish
  ) => {
    if (!account) {
      return console.error('RequestWithdraw:: Account is undefined')
    }

    if (!chainId) {
      return console.error('RequestWithdraw:: ChainId is undefined')
    }

    setIsLoading(true)
    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const kycSignatureParams = await sdk.UserLending.buildKycSignatureParams(
        account as HexString,
        chainId.toString()
      )

      const kycData = await generateKycSignature(kycSignatureParams)

      if (!kycData) {
        throw new Error('RequestWithdrawal:: Error generating signature')
      }

      const txResponse = await sdk.UserLending.requestWithdrawal(
        lendingPool,
        tranche,
        amount
      )

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
