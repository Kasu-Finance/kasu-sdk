import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { buildSignatureMessage } from '@nexeraid/identity-sdk'
import { useContext } from 'react'

import kycContext from '@/context/kyc/kyc.context'
import { IdentityClientData, KycTypes } from '@/context/kyc/kyc.types'

import { generateKycToken } from '@/actions/generateKycToken'

const useKycState = (): KycTypes => {
  const context = useContext(kycContext)

  if (!Object.keys(context).length) {
    throw new Error('KycContext must be used within its provider')
  }

  const { identityClient, dispatch } = context

  const initClient = async (
    signer: JsonRpcSigner,
    initData: Omit<IdentityClientData, 'userAddress'>
  ) => {
    identityClient.onSignMessage(async (data) => {
      return (await signer.signMessage(data.message)) as `0x${string}`
    })

    identityClient.onVerification((isVerified) => {
      // eslint-disable-next-line
      console.log('on verified', isVerified)
      dispatch({
        type: 'SET_KYC_COMPLETED',
        payload: true,
      })
    })
    identityClient.onKycCompletion((data) => {
      // eslint-disable-next-line
      console.log('On kyc completion', data)
      dispatch({
        type: 'SET_KYC_COMPLETED',
        payload: true,
      })
    })

    identityClient.onCloseScreen(async () => {
      return new Promise((resolve) => {
        // eslint-disable-next-line
        console.log('On Close Screen callback')
        dispatch({
          type: 'SET_KYC_COMPLETED',
          payload: true,
        })
        resolve('')
      })
    })

    await identityClient.init(initData)
  }

  const authenticate = async (provider: Web3Provider) => {
    const signer = provider.getSigner()

    const account = (await signer.getAddress()).toLowerCase()

    const signingMessage = buildSignatureMessage(account as `0x${string}`)

    const signature = await signer.signMessage(signingMessage)

    const accessToken = await generateKycToken(account)

    if (!accessToken) return

    await initClient(signer, { accessToken, signature, signingMessage })

    dispatch({
      type: 'AUTHENTICATE',
      payload: {
        accessToken,
        signature,
        signingMessage,
        userAddress: account,
      },
    })
  }

  return {
    ...context,
    authenticate,
  }
}

export default useKycState
