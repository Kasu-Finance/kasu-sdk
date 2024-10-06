import { useWeb3React } from '@web3-react/core'
import { BigNumber, BytesLike } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useGenerateSwapData from '@/hooks/lending/useGenerateSwapData'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import generateKycSignature from '@/actions/generateKycSignature'
import { ONE_INCH_SLIPPAGE } from '@/config/api.oneInch'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { SupportedTokens } from '@/constants/tokens'
import { toBigNumber, waitForReceipt } from '@/utils'

import { HexString } from '@/types/lending'
import { PoolOverviewWithDelegate } from '@/types/page'

const useRequestDeposit = () => {
  const sdk = useKasuSDK()

  const { account, chainId } = useWeb3React()

  const handleError = useHandleError()

  const { setTxHash, trancheId, amount, selectedToken } = useDepositModalState()

  const supportedTokens = useSupportedTokenInfo()

  const { nextStep } = useStepperState()

  const { setToast, removeToast } = useToastState()

  const generateSwapData = useGenerateSwapData()

  return async (
    lendingPoolId: `0x${string}`,
    selectedTranche: PoolOverviewWithDelegate['tranches'][number],
    fixedTermConfigId: string,
    currentEpochDepositedAmount: string
  ) => {
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

      const isETH = selectedToken === SupportedTokens.ETH

      const fromToken = supportedTokens[selectedToken]
      const fromAmount = parseUnits(amount, fromToken.decimals).toString()

      const currentDepositedAmount = toBigNumber(currentEpochDepositedAmount, 6)

      const trancheMax = toBigNumber(selectedTranche.maximumDeposit, 6).sub(
        currentDepositedAmount
      )

      let maxAmount = BigNumber.from(fromAmount).gt(trancheMax)
        ? trancheMax.toString()
        : fromAmount

      let swapData: BytesLike = '0x'

      if (selectedToken !== SupportedTokens.USDC) {
        const toToken = supportedTokens[SupportedTokens.USDC].address

        const res = await generateSwapData(
          chainId,
          fromToken.address,
          toToken,
          fromAmount,
          account as `0x${string}`,
          (parseFloat(ONE_INCH_SLIPPAGE) * 100).toString()
        )

        if ('error' in res) {
          throw new Error(
            `RequestDeposit:: Error generating swap data. ${res.error}`
          )
        }

        const dstAmount = res.dstAmount // returned from one_inch

        const maxSwapAmount = toBigNumber(
          (parseFloat(dstAmount) * 1.05).toString(),
          6
        )

        // if the swapped amount is less than the maxmium tranche allowed, use the swap amount
        if (maxSwapAmount.lt(trancheMax)) {
          maxAmount = maxSwapAmount.toString()
        } else {
          maxAmount = trancheMax.toString()
        }

        const minAmountOut = currentDepositedAmount.isZero()
          ? selectedTranche.minimumDeposit
          : '1'

        swapData = sdk.UserLending.buildDepositSwapData(
          fromToken.address,
          isETH ? '0' : fromAmount, // when using ETH, we pass in ethValue during transaction instead
          res.tx.to,
          res.tx.data,
          minAmountOut
        )
      }

      const deposit = await sdk.UserLending.requestDepositWithKyc(
        lendingPoolId,
        trancheId,
        maxAmount.toString(),
        swapData,
        fixedTermConfigId,
        kycData.blockExpiration,
        kycData.signature,
        isETH ? fromAmount : '0' // when using ETH, pass the value  directly here
      )

      const receipt = await waitForReceipt(deposit)

      setTxHash(receipt.transactionHash)

      removeToast()

      nextStep()
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
