'use client'

import { IdentityClient } from '@nexeraid/identity-sdk'
import { useWeb3React } from '@web3-react/core'
import { ReactNode, useEffect, useReducer } from 'react'

import KycContext from '@/context/kyc/kyc.context'
import kycReducer from '@/context/kyc/kyc.reducer'
import { KycStateType } from '@/context/kyc/kyc.types'

import checkUserKycState from '@/actions/checkUserKycState'

type KycStateProps = {
  children: ReactNode
}

const initialState: KycStateType = {
  authenticatedUser: undefined,
  isAuthenticated: false,
  kycCompleted: false,
  identityClient: new IdentityClient(),
}

const KycState: React.FC<KycStateProps> = ({ children }) => {
  const { account } = useWeb3React()

  const [state, dispatch] = useReducer(kycReducer, initialState)

  useEffect(() => {
    if (account && account.toLowerCase() !== state.authenticatedUser) {
      dispatch({ type: 'RESET_AUTHENTICATION' })
    }
  }, [account, state.authenticatedUser])

  useEffect(() => {
    if (account) {
      ;(async () => {
        try {
          const status = await checkUserKycState(account)

          dispatch({
            type: 'SET_KYC_COMPLETED',
            payload: status === 'Active',
          })
        } catch (error) {
          console.error(error)
        }
      })()
    }
  }, [account])

  return (
    <KycContext.Provider value={{ ...state, dispatch }}>
      {children}
    </KycContext.Provider>
  )
}

export default KycState
