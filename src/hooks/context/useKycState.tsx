import { JsonRpcSigner } from '@ethersproject/providers'
import { buildSignatureMessage } from '@nexeraid/identity-sdk'
import { useCallback, useContext } from 'react'

import kycContext from '@/context/kyc/kyc.context'
import { IdentityClientData, KycTypes } from '@/context/kyc/kyc.types'

import checkUserKycState from '@/actions/checkUserKycState'
import generateKycToken from '@/actions/generateKycToken'

const useKycState = (): KycTypes => {
  const context = useContext(kycContext)

  if (!Object.keys(context).length) {
    throw new Error('KycContext must be used within its provider')
  }

  const { identityClient, dispatch } = context

  const verifyUserKyc = useCallback(
    async (userAddress: string) => {
      const status = await checkUserKycState(userAddress)

      dispatch({
        type: 'SET_KYC_COMPLETED',
        payload: status === 'Active',
      })

      return status
    },
    [dispatch]
  )

  const initializeClient = async (
    signer: JsonRpcSigner,
    initData: IdentityClientData,
    sdkReadyCallback: () => void,
    closeScreenCallback: (kycCompleted: boolean) => void
  ) => {
    const { userAddress, ...authInput } = initData

    identityClient.onSignMessage(async (data) => {
      const signedMessage = await signer.signMessage(data.message)
      return signedMessage as `0x${string}`
    })

    identityClient.onSdkReady(sdkReadyCallback)

    identityClient.onCloseScreen(async () => {
      const status = await verifyUserKyc(userAddress)

      closeScreenCallback(status === 'Active')

      return new Promise((resolve) => resolve(''))
    })

    await identityClient.init(authInput)
  }

  const authenticate = async (
    signer: JsonRpcSigner
  ): Promise<IdentityClientData> => {
    const account = (await signer.getAddress()).toLowerCase()

    const signingMessage = buildSignatureMessage(account as `0x${string}`)

    const signature = await signer.signMessage(signingMessage)

    const accessToken = await generateKycToken(account)

    if (!accessToken) throw new Error('Error getting access token')

    dispatch({
      type: 'AUTHENTICATE',
      payload: account,
    })

    return {
      accessToken,
      signature,
      signingMessage,
      userAddress: account,
    }
  }

  return {
    ...context,
    authenticate,
    initializeClient,
  }
}

export default useKycState
