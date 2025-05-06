'use client'

// @ts-ignore export error
import { ReactNode, useEffect, useReducer } from 'react'
import { useAccount } from 'wagmi'

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
  kycInfo: undefined,
  kycCompleted: false,
}

const KycState: React.FC<KycStateProps> = ({ children }) => {
  const account = useAccount()

  console.log(account)

  const [state, dispatch] = useReducer(kycReducer, initialState)

  const { setToast, removeToast } = useToastState()

  const kycActions = useKycActions(dispatch)

  const {
    setLastVerifiedAccount,
    setCustomerKycInfo,
    setIsVerifying,
    setKycCompleted,
  } = kycActions

  useEffect(() => {
    if (
      account.address &&
      state.lastVerifiedAccount &&
      account.address.toLowerCase() !== state.lastVerifiedAccount.toLowerCase()
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
    ;(async () => {
      try {
        if (!account.address) return

        setIsVerifying(true)
        setKycCompleted(false)

        setLastVerifiedAccount(account.address)

        const kyc = await checkUserKycState(account.address)

        if (!kyc) return

        setCustomerKycInfo(kyc)

        // no email status means kyc completed but email is not present ( edge case for users that setup KYC before email was setup )
        if (kyc.status === 'Active' || kyc.status === 'No Email') {
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
  }, [
    account,
    setCustomerKycInfo,
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
