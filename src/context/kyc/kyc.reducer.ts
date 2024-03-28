import { KycActions, KycStateType } from '@/context/kyc/kyc.types'

const kycReducer = (state: KycStateType, action: KycActions): KycStateType => {
  switch (action.type) {
    case 'SET_IS_VERIFYING':
      return {
        ...state,
        isVerifying: action.payload,
      }
    case 'AUTHENTICATE':
      return {
        ...state,
        isAuthenticated: true,
        authenticatedUser: action.payload,
      }
    case 'RESET_AUTHENTICATION':
      return {
        ...state,
        isAuthenticated: false,
        kycCompleted: false,
        authenticatedUser: undefined,
      }
    case 'SET_KYC_COMPLETED':
      return {
        ...state,
        isAuthenticated: true,
        kycCompleted: true,
        authenticatedUser: action.payload,
      }
    default:
      return state
  }
}

export default kycReducer
