'use client'

// @ts-ignore export error
import { ReactNode, useCallback, useEffect, useReducer } from 'react'

import useToastState from '@/hooks/context/useToastState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import KycContext from '@/context/kyc/kyc.context'
import kycReducer from '@/context/kyc/kyc.reducer'
import { KycStateType } from '@/context/kyc/kyc.types'

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
  const [state, dispatch] = useReducer(kycReducer, initialState)

  const { setToast, removeToast } = useToastState()

  const kycActions = useKycActions(dispatch)

  const { address, isAuthenticated } = usePrivyAuthenticated()

  const {
    setLastVerifiedAccount,
    setCustomerKycInfo,
    setIsVerifying,
    setKycCompleted,
  } = kycActions

  const checkUserKyc = useCallback(
    async (account: string, signal?: AbortSignal) => {
      try {
        if (!account) return

        setIsVerifying(true)
        setKycCompleted(false)

        setLastVerifiedAccount(account)

        const kycRes = await fetch(
          `/api/kyc?${new URLSearchParams({
            userAddress: account.toLowerCase(),
          })}`,
          { signal }
        )

        if (kycRes.status !== 200) return

        const kyc = await kycRes.json()

        if (!kyc) return

        setCustomerKycInfo(kyc)

        // no email status means kyc completed but email is not present ( edge case for users that setup KYC before email was setup )
        if (kyc.status === 'Active' || kyc.status === 'No Email') {
          setKycCompleted(true)
        } else {
          setKycCompleted(false)
        }
      } catch (error) {
        if (error !== 'new wallets detected') {
          console.error(error)
        }
      } finally {
        setIsVerifying(false)
        removeToast()
      }
    },
    [
      setIsVerifying,
      setKycCompleted,
      setLastVerifiedAccount,
      setCustomerKycInfo,
      removeToast,
    ]
  )

  useEffect(() => {
    if (
      isAuthenticated &&
      address &&
      state.lastVerifiedAccount &&
      address.toLowerCase() !== state.lastVerifiedAccount.toLowerCase()
    ) {
      setToast({
        type: 'info',
        title: 'Account change detected',
        message: 'Verifying status of new account...',
        isClosable: false,
      })
      checkUserKyc(address)
    }
  }, [
    isAuthenticated,
    address,
    state.lastVerifiedAccount,
    setToast,
    checkUserKyc,
  ])

  return (
    <KycContext.Provider value={{ ...state, ...kycActions, checkUserKyc }}>
      {children}
    </KycContext.Provider>
  )
}

export default KycState
