import { JsonRpcSigner } from '@ethersproject/providers'
import { IdentityClient } from '@nexeraid/identity-sdk'

export type IdentityClientData = {
  accessToken: string
  signingMessage: string
  signature: string
  userAddress: string
}

export type KycActions =
  | {
      type: 'AUTHENTICATE'
      payload: string
    }
  | {
      type: 'RESET_AUTHENTICATION'
    }
  | {
      type: 'SET_KYC_COMPLETED'
      payload: boolean
    }

export type KycStateType = {
  isAuthenticated: boolean
  authenticatedUser: string | undefined
  identityClient: IdentityClient
  kycCompleted: boolean
}

export type KycFunctions = {
  authenticate: (
    signer: JsonRpcSigner,
    callback: () => void
  ) => Promise<IdentityClientData>
  initializeClient: (
    signer: JsonRpcSigner,
    initData: IdentityClientData,
    sdkReadyCallback: () => void,
    closeScreenCallback: (kycCompleted: boolean) => void
  ) => void
}

export type KycTypes = KycStateType & KycFunctions
