import { JsonRpcSigner } from '@ethersproject/providers'
// @ts-ignore export error
import { buildSignatureMessage, IdentityClient } from '@nexeraid/identity-sdk'
import { Dispatch, useCallback, useMemo } from 'react'

import {
  IdentityClientData,
  KycActions,
  KycFunctions,
} from '@/context/kyc/kyc.types'

import checkUserKycState from '@/actions/checkUserKycState'
import generateKycToken from '@/actions/generateKycToken'

const useKycActions = (
  dispatch: Dispatch<KycActions>,
  identityClient: IdentityClient
): KycFunctions => {
  const verifyUserKyc = useCallback(
    async (userAddress: string) => {
      const status = await checkUserKycState(userAddress)

      if (status === 'Active') {
        dispatch({
          type: 'SET_KYC_COMPLETED',
          payload: userAddress.toLowerCase(),
        })
      }

      return status
    },
    [dispatch]
  )

  return useMemo(
    () => ({
      authenticate: async (
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
      },
      initializeClient: async (
        signer: JsonRpcSigner,
        initData: IdentityClientData,
        sdkReadyCallback: () => void,
        closeScreenCallback: (kycCompleted: boolean) => void
      ) => {
        const { userAddress, ...authInput } = initData

        identityClient.onSignMessage(async (data: any) => {
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
      },
    }),
    [dispatch, identityClient, verifyUserKyc]
  )
}

export default useKycActions
