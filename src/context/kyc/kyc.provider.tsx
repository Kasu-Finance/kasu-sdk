'use client'

import { IdentityClient } from '@nexeraid/identity-sdk'
import { useWeb3React } from '@web3-react/core'
import { ReactNode, useEffect, useReducer } from 'react'

import useKycActions from '@/context/kyc/kyc.actions'
import KycContext from '@/context/kyc/kyc.context'
import kycReducer from '@/context/kyc/kyc.reducer'
import { KycStateType } from '@/context/kyc/kyc.types'

import checkUserKycState from '@/actions/checkUserKycState'

type KycStateProps = {
  children: ReactNode
}

const initialState: KycStateType = {
  isVerifying: false,
  authenticatedUser: undefined,
  isAuthenticated: false,
  kycCompleted: false,
  identityClient: new IdentityClient(),
}

const KycState: React.FC<KycStateProps> = ({ children }) => {
  const { account } = useWeb3React()

  const [state, dispatch] = useReducer(kycReducer, initialState)

  const kycActions = useKycActions(dispatch, state.identityClient)

  useEffect(() => {
    if (account && account.toLowerCase() !== state.authenticatedUser) {
      dispatch({ type: 'RESET_AUTHENTICATION' })
    }
  }, [account, state.authenticatedUser])

  useEffect(() => {
    if (account) {
      ;(async () => {
        try {
          dispatch({
            type: 'SET_IS_VERIFYING',
            payload: true,
          })

          const status = await checkUserKycState(account)

          if (status === 'Active') {
            dispatch({
              type: 'SET_KYC_COMPLETED',
              payload: account.toLowerCase(),
            })
          }
        } catch (error) {
          console.error(error)
        } finally {
          dispatch({
            type: 'SET_IS_VERIFYING',
            payload: false,
          })
        }
      })()
    }
  }, [account])

  return (
    <KycContext.Provider value={{ ...state, ...kycActions }}>
      {children}
    </KycContext.Provider>
  )
}

export default KycState
