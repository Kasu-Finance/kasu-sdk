import { useWeb3React } from '@web3-react/core'
import { parseUnits } from 'ethers/lib/utils'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useToastState from '@/hooks/context/useToastState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import generateKycSignature from '@/actions/generateKycSignature'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useRequestDeposit = () => {
  const sdk = useKasuSDK()

  const { account, chainId } = useWeb3React()

  const handleError = useHandleError()

  const { setTxHash } = useDepositModalState()

  const { setModalStatusAction } = useModalStatusState()

  const { setToast, removeToast } = useToastState()

  return async (
    lendingPoolId: `0x${string}`,
    trancheId: `0x${string}`,
    amount: string
  ) => {
    if (!account) {
      return console.error('RequestDeposit:: Account is undefined')
    }

    if (!chainId) {
      return console.error('RequestDeposit:: ChainId is undefined')
    }

    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const kycSignatureParams = await sdk.UserLending.buildKycSignatureParams(
        account as `0x${string}`,
        chainId.toString()
      )

      const kycData = await generateKycSignature(kycSignatureParams)

      if (!kycData) {
        throw new Error('RequestDeposit:: Error generating signature')
      }

      const deposit = await sdk.UserLending.requestDepositWithKyc(
        lendingPoolId,
        trancheId,
        parseUnits(amount, 6).toString(),
        kycData.blockExpiration,
        kycData.signature
      )

      const receipt = await waitForReceipt(deposit)

      setTxHash(receipt.transactionHash)

      setModalStatusAction(ModalStatusAction.COMPLETED)

      removeToast()
    } catch (error) {
      handleError(
        error,
        `${ActionType.DEPOSIT} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.DEPOSIT][ActionStatus.ERROR]
      )
    }
  }
}

export default useRequestDeposit
