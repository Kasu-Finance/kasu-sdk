import { useWeb3React } from '@web3-react/core'
import { BytesLike } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useToastState from '@/hooks/context/useToastState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import generateKycSignature from '@/actions/generateKycSignature'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

import { HexString } from '@/types/lending'

const useRequestDeposit = () => {
  const sdk = useKasuSDK()

  const { account, chainId } = useWeb3React()

  const handleError = useHandleError()

  const { setTxHash, trancheId, amount } = useDepositModalState()

  const supportedTokens = useSupportedTokenInfo()

  const { setModalStatusAction } = useModalStatusState()

  const { setToast, removeToast } = useToastState()

  // const generateSwapData = useGenerateSwapData()

  return async (lendingPoolId: `0x${string}`) => {
    if (!account) {
      return console.error('RequestDeposit:: Account is undefined')
    }

    if (!chainId) {
      return console.error('RequestDeposit:: ChainId is undefined')
    }

    if (!supportedTokens) {
      return console.error('RequestDeposit:: SupportedTokens is undefined')
    }

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
        throw new Error('RequestDeposit:: Error generating signature')
      }

      const swapData: BytesLike = '0x'

      // if (selectedToken !== SupportedTokens.USDC) {
      //   const fromToken = supportedTokens[selectedToken]
      //   const toToken = supportedTokens[SupportedTokens.USDC].address

      //   const res = await generateSwapData(
      //     chainId,
      //     fromToken.address,
      //     toToken,
      //     parseUnits(amount, fromToken.decimals).toString(),
      //     account as `0x${string}`,
      //     (parseFloat(ONE_INCH_SLIPPAGE) * 100).toString()
      //   )

      //   if ('error' in res) {
      //     throw new Error(res.error)
      //   }

      //   const swapTarget = ONE_INCH_ROUTER
      //   const token = toToken
      //   const swapCallData = res.tx.data

      //   swapData = defaultAbiCoder.encode(
      //     ['address', 'address', 'bytes'],
      //     [swapTarget, token, swapCallData]
      //   )
      // }

      const deposit = await sdk.UserLending.requestDepositWithKyc(
        lendingPoolId,
        trancheId,
        parseUnits(amount, 6).toString(),
        swapData,
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
