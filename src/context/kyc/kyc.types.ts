import { Config } from '@compilot/react-sdk'

import { CustomerStatus } from '@/actions/checkUserKycState'

export type IdentityClientData = {
  accessToken: string
  signingMessage: string
  signature: string
  userAddress: string
}

export type KycActions =
  | {
      type: 'RESET_AUTHENTICATION'
    }
  | {
      type: 'SET_KYC_COMPLETED'
      payload: string
    }
  | {
      type: 'SET_IS_VERIFYING'
      payload: boolean
    }
  | {
      type: 'SET_CUSTOMER_STATUS'
      payload: CustomerStatus
    }

export type KycStateType = {
  isVerifying: boolean
  status: CustomerStatus
  authenticatedUser: string | undefined
  kycCompleted: boolean
}

export type KycFunctions = {
  handleOpenWidget: (
    compilotConfig: Config,
    handleClose: () => void,
    successCallback?: () => void
  ) => void
  setIsVerifying: (isVerifying: boolean) => void
  setCustomerStatus: (customStatus: CustomerStatus) => void
  setKycCompleted: (account: string) => void
  resetAuthenticatedUser: () => void
}

export type KycTypes = KycStateType & KycFunctions
