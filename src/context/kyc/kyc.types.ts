import { Web3Provider } from '@ethersproject/providers'
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
      payload: IdentityClientData
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
  identityClient: IdentityClient
  identityClientData: IdentityClientData | undefined
  kycCompleted: boolean
}

export type KycFunctions = {
  authenticate(provider: Web3Provider): void
}

export type KycTypes = KycStateType & KycFunctions
