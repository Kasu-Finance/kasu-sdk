'use client'

// @ts-ignore export error
import { useWeb3React } from '@web3-react/core'
import { ReactNode, useEffect, useReducer } from 'react'

import useToastState from '@/hooks/context/useToastState'

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
  lastVerifiedAccount: undefined,
  status: null,
  kycCompleted: false,
}

const KycState: React.FC<KycStateProps> = ({ children }) => {
  const { account } = useWeb3React()

  const [state, dispatch] = useReducer(kycReducer, initialState)

  const { setToast, removeToast } = useToastState()

  const kycActions = useKycActions(dispatch)

  const {
    setLastVerifiedAccount,
    setCustomerStatus,
    setIsVerifying,
    setKycCompleted,
  } = kycActions

  useEffect(() => {
    if (
      account &&
      state.lastVerifiedAccount &&
      account.toLowerCase() !== state.lastVerifiedAccount.toLowerCase()
    ) {
      setToast({
        type: 'info',
        title: 'Account change detected',
        message: 'Verifying status of new account...',
        isClosable: false,
      })
    }
  }, [account, state.lastVerifiedAccount, setToast])

  useEffect(() => {
    if (account) {
      ;(async () => {
        try {
          setIsVerifying(true)
          setKycCompleted(false)

          setLastVerifiedAccount(account)

          const status = await checkUserKycState(account)

          if (!status) return

          setCustomerStatus(status)

          // no email status means kyc completed but email is not present ( edge case for users that setup KYC before email was setup )
          if (status === 'Active' || status === 'No Email') {
            setKycCompleted(true)
          } else {
            setKycCompleted(false)
          }
        } catch (error) {
          console.error(error)
        } finally {
          setIsVerifying(false)
          removeToast()
        }
      })()
    }
  }, [
    account,
    setCustomerStatus,
    setLastVerifiedAccount,
    setIsVerifying,
    setKycCompleted,
    removeToast,
  ])

  return (
    <KycContext.Provider value={{ ...state, ...kycActions }}>
      {children}
    </KycContext.Provider>
  )
}

export default KycState
