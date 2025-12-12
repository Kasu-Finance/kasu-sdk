import { BigNumber, BytesLike } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { useChainId } from 'wagmi'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useKycState from '@/hooks/context/useKycState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useSdk from '@/hooks/context/useSdk'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useBuildDepositData from '@/hooks/lending/useBuildDepositData'
import useHandleError from '@/hooks/web3/useHandleError'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'

import { KasuSdkNotReadyError } from '@/context/sdk/sdk.types'

import generateKycSignature from '@/actions/generateKycSignature'
import { Routes } from '@/config/routes'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { SupportedTokens } from '@/constants/tokens'
import { capitalize, toBigNumber, waitForReceipt } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

const useRequestDeposit = () => {
  const sdk = useSdk()

  const { address } = usePrivyAuthenticated()

  const { isLiteMode } = useLiteModeState()

  const pathname = usePathname()

  const router = useRouter()

  const chainId = useChainId()

  const handleError = useHandleError()

  const { setTxHash, trancheId, amount, selectedToken } = useDepositModalState()

  const { kycInfo } = useKycState()

  const supportedTokens = useSupportedTokenInfo()

  const { nextStep } = useStepperState()

  const { setToast, removeToast } = useToastState()

  const buildDepositData = useBuildDepositData()

  return async (
    lendingPoolId: `0x${string}`,
    selectedTranche: PoolOverviewWithDelegate['tranches'][number],
    fixedTermConfigId: string,
    currentEpochDepositedAmount: string,
    contractAcceptedSignature: string,
    contractAcceptedTimstamp: EpochTimeStamp,
    contractVersion: number,
    contractType: 'retail' | 'exempt'
  ) => {
    if (!address) {
      return console.error('RequestDeposit:: Account is undefined')
    }

    if (!chainId) {
      return console.error('RequestDeposit:: ChainId is undefined')
    }

    if (!supportedTokens) {
      return console.error('RequestDeposit:: SupportedTokens is undefined')
    }

    if (!kycInfo) {
      return console.error('RequestDeposit:: KycInfo is undefined')
    }
    try {
      if (!sdk) {
        throw new KasuSdkNotReadyError()
      }

      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const kycSignatureParams = await sdk.UserLending.buildKycSignatureParams(
        address,
        chainId.toString()
      )

      const kycData = await generateKycSignature(kycSignatureParams)

      if (!kycData) {
        throw new Error('RequestDeposit:: Error generating signature')
      }

      if (selectedToken !== SupportedTokens.USDC) {
        return console.error('RequestDeposit:: Only USDC is supported')
      }

      const fromToken = supportedTokens[SupportedTokens.USDC]
      const fromAmount = parseUnits(amount, fromToken.decimals).toString()

      const currentDepositedAmount = toBigNumber(currentEpochDepositedAmount, 6)

      const trancheMax = toBigNumber(selectedTranche.maximumDeposit, 6).sub(
        currentDepositedAmount
      )

      const maxAmount = BigNumber.from(fromAmount).gt(trancheMax)
        ? trancheMax.toString()
        : fromAmount

      const swapData: BytesLike = '0x'

      const versionType =
        (contractVersion << 8) + (contractType === 'retail' ? 0 : 1)

      const depositData = buildDepositData(
        contractAcceptedSignature,
        contractAcceptedTimstamp,
        versionType
      )

      const deposit = await sdk.UserLending.requestDepositWithKyc(
        lendingPoolId,
        trancheId,
        maxAmount.toString(),
        swapData,
        fixedTermConfigId,
        depositData,
        kycData,
        '0' // when using ETH, pass the value directly here; USDC has no native value
      )

      const receipt = await waitForReceipt(deposit)

      setTxHash(receipt.transactionHash)

      removeToast()

      if (isLiteMode && pathname !== Routes.portfolio.root.url) {
        router.push(Routes.portfolio.root.url)
      }

      nextStep()
    } catch (error) {
      handleError(
        error,
        capitalize(`${ActionType.DEPOSIT} ${ActionStatus.ERROR}`),
        ACTION_MESSAGES[ActionType.DEPOSIT][ActionStatus.ERROR]
      )
    }
  }
}

export default useRequestDeposit
