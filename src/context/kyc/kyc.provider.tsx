'use client'

// @ts-ignore export error
import { useWeb3React } from '@web3-react/core'
import { ReactNode, useEffect, useReducer } from 'react'

import KycContext from '@/context/kyc/kyc.context'
import kycReducer from '@/context/kyc/kyc.reducer'
import { KycStateType } from '@/context/kyc/kyc.types'

import checkUserKycState from '@/actions/checkUserKycState'

import useKycActions from './kyc.actions'

type KycStateProps = {
  children: ReactNode
}

const initialState: KycStateType = {
  isVerifying: false,
  authenticatedUser: undefined,
  status: null,
  kycCompleted: false,
}

const KycState: React.FC<KycStateProps> = ({ children }) => {
  const { account } = useWeb3React()

  const [state, dispatch] = useReducer(kycReducer, initialState)

  const kycActions = useKycActions(dispatch)

  const {
    resetAuthenticatedUser,
    setCustomerStatus,
    setIsVerifying,
    setKycCompleted,
  } = kycActions

  // reset auth when account is changed
  useEffect(() => {
    if (account && account.toLowerCase() !== state.authenticatedUser) {
      resetAuthenticatedUser()
    }
  }, [account, state.authenticatedUser, resetAuthenticatedUser])

  // verify user kyc status upon account connect / change
  useEffect(() => {
    if (account) {
      ;(async () => {
        try {
          setIsVerifying(true)

          const status = await checkUserKycState(account)

          if (!status) return

          setCustomerStatus(status)

          // no email status means kyc completed but email is not present ( edge case for users that setup KYC before email was setup )
          if (status === 'Active' || status === 'No Email') {
            setKycCompleted(account.toLowerCase())
          }
        } catch (error) {
          console.error(error)
        } finally {
          setIsVerifying(false)
        }
      })()
    }
  }, [account, setCustomerStatus, setIsVerifying, setKycCompleted])

  return (
    <KycContext.Provider value={{ ...state, ...kycActions }}>
      {children}
    </KycContext.Provider>
  )
}

export default KycState
