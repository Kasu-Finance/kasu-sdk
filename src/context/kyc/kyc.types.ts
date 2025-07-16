import { Config } from '@compilot/react-sdk'

import { CustomerStatus } from '@/app/api/kyc/route'

export type IdentityClientData = {
  accessToken: string
  signingMessage: string
  signature: string
  userAddress: string
}

export type KycActions =
  | {
      type: 'SET_LAST_VERIFIED_ACCOUNT'
      payload: string
    }
  | {
      type: 'SET_KYC_COMPLETED'
      payload: boolean
    }
  | {
      type: 'SET_IS_VERIFYING'
      payload: boolean
    }
  | {
      type: 'SET_CUSTOMER_STATUS'
      payload: { type: 'Company' | 'Individual'; status: CustomerStatus }
    }

export type KycStateType = {
  isVerifying: boolean
  kycInfo:
    | { type: 'Company' | 'Individual'; status: CustomerStatus }
    | undefined
  lastVerifiedAccount: string | undefined
  kycCompleted: boolean
}

export type KycFunctions = {
  handleOpenWidget: (
    compilotConfig: Config,
    handleClose: () => void,
    successCallback?: () => void
  ) => void
  setIsVerifying: (isVerifying: boolean) => void
  setCustomerKycInfo: (customStatus: {
    type: 'Company' | 'Individual'
    status: CustomerStatus
  }) => void
  setKycCompleted: (kycCompleted: boolean) => void
  setLastVerifiedAccount: (account: string) => void
}

export type KycTypes = KycStateType &
  KycFunctions & {
    checkUserKyc: (account: string, signal?: AbortSignal) => Promise<void>
  }
