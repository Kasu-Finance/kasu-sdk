import { KycActions, KycStateType } from '@/context/kyc/kyc.types'

const kycReducer = (state: KycStateType, action: KycActions): KycStateType => {
  switch (action.type) {
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
      }
    case 'SET_KYC_COMPLETED':
      return {
        ...state,
        kycCompleted: action.payload,
      }
    default:
      return state
  }
}

export default kycReducer
