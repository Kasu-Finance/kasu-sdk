'use client'

import { IdentityClient } from '@nexeraid/identity-sdk'
import { useWeb3React } from '@web3-react/core'
import { ReactNode, useEffect, useReducer } from 'react'

import KycContext from '@/context/kyc/kyc.context'
import kycReducer from '@/context/kyc/kyc.reducer'
import { KycStateType } from '@/context/kyc/kyc.types'

type KycStateProps = {
  children: ReactNode
}

const initialState: KycStateType = {
  identityClientData: undefined,
  isAuthenticated: false,
  kycCompleted: false,
  identityClient: new IdentityClient(),
}

const KycState: React.FC<KycStateProps> = ({ children }) => {
  const { account } = useWeb3React()

  const [state, dispatch] = useReducer(kycReducer, initialState)

  useEffect(() => {
    if (
      account &&
      state.identityClientData &&
      account.toLowerCase() !== state.identityClientData.userAddress
    ) {
      dispatch({ type: 'RESET_AUTHENTICATION' })
    }
  }, [account, state.identityClientData])

  return (
    <KycContext.Provider value={{ ...state, dispatch }}>
      {children}
    </KycContext.Provider>
  )
}

export default KycState
