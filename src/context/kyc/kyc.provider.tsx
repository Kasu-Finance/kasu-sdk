'use client'

// @ts-ignore export error
import { ReactNode, useCallback, useEffect, useReducer, useRef } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import KycContext from '@/context/kyc/kyc.context'
import kycReducer from '@/context/kyc/kyc.reducer'
import { KycStateType } from '@/context/kyc/kyc.types'
import { ModalsKeys } from '@/context/modal/modal.types'

import { ActionStatus } from '@/constants'
import { capitalize } from '@/utils'

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

  const { openModal } = useModalState()

  const kycActions = useKycActions(dispatch)

  const { address, isAuthenticated } = usePrivyAuthenticated()

  const latestKycCheckIdRef = useRef(0)
  const latestKycCheckAccountRef = useRef<string | null>(null)
  const latestKycAbortControllerRef = useRef<AbortController | null>(null)

  const {
    setLastVerifiedAccount,
    setCustomerKycInfo,
    setIsVerifying,
    setKycCompleted,
  } = kycActions

  const checkUserKyc = useCallback(
    async (account: string, signal?: AbortSignal) => {
      const requestId = ++latestKycCheckIdRef.current
      const normalizedAccount = account.toLowerCase()

      latestKycCheckAccountRef.current = normalizedAccount
      latestKycAbortControllerRef.current?.abort('new wallets detected')

      const abortController = new AbortController()
      latestKycAbortControllerRef.current = abortController

      let followUpToast: Parameters<typeof setToast>[0] | undefined | null =
        null

      try {
        if (!account) return

        setIsVerifying(true)
        setKycCompleted(false)

        setLastVerifiedAccount(account)

        if (signal?.aborted) {
          abortController.abort(
            (signal as AbortSignal & { reason?: unknown }).reason
          )
        } else if (signal) {
          signal.addEventListener(
            'abort',
            () => {
              abortController.abort(
                (signal as AbortSignal & { reason?: unknown }).reason
              )
            },
            { once: true }
          )
        }

        const kycRes = await fetch(
          `/api/kyc?${new URLSearchParams({
            userAddress: normalizedAccount,
          })}`,
          { signal: abortController.signal }
        )

        if (!kycRes.ok) {
          let message = 'Unable to verify identity status. Please try again.'

          try {
            const data = await kycRes.json()
            if (typeof data?.message === 'string') {
              message = data.message
            }
          } catch (parseError) {
            void parseError
          }

          followUpToast = {
            type: 'error',
            title: capitalize(ActionStatus.ERROR),
            message,
            action: {
              label: 'Retry',
              onClick: () => checkUserKyc(account),
            },
          }

          return
        }

        const kyc = await kycRes.json()

        if (!kyc) return

        setCustomerKycInfo(kyc)

        // no email status means kyc completed but email is not present ( edge case for users that setup KYC before email was setup )
        if (kyc.status === 'Active' || kyc.status === 'No Email') {
          setKycCompleted(true)
        } else {
          setKycCompleted(false)
        }

        if (kyc.status === 'No status') {
          followUpToast = {
            type: 'info',
            title: 'Identity verification required',
            message:
              'Your wallet is connected, but identity verification is not completed yet.',
            isClosable: false,
            action: {
              label: 'Start verification',
              onClick: () => {
                removeToast()
                openModal({
                  name: ModalsKeys.KYC,
                  callback: () => {},
                })
              },
            },
          }
        }

        if (kyc.status === 'To be reviewed' || kyc.status === 'Escalated') {
          followUpToast = {
            type: 'warning',
            title: capitalize(ActionStatus.PROCESSING),
            message:
              'Your identity verification is being reviewed. Please return later or refresh your status.',
            action: {
              label: 'Refresh status',
              onClick: () => checkUserKyc(account),
            },
          }
        }

        if (
          kyc.status === 'Rejected' ||
          kyc.status === 'Failed' ||
          kyc.status === 'Terminated'
        ) {
          const reason =
            typeof kyc.reason === 'string' && kyc.reason.trim().length
              ? ` Reason: ${kyc.reason}`
              : ''

          followUpToast = {
            type: 'error',
            title: capitalize(ActionStatus.REJECTED),
            message: `Your identity verification was not approved.${reason}`,
            action: kyc.canRetry
              ? {
                  label: 'Retry verification',
                  onClick: () =>
                    openModal({
                      name: ModalsKeys.KYC,
                      callback: () => {},
                    }),
                }
              : undefined,
          }
        }
      } catch (error) {
        if ((error as { name?: string } | null)?.name === 'AbortError') {
          return
        }
        if (error !== 'new wallets detected') {
          console.error(error)
        }
      } finally {
        const isLatestRequest = requestId === latestKycCheckIdRef.current

        if (isLatestRequest) {
          setIsVerifying(false)
          removeToast()

          if (followUpToast) {
            setToast(followUpToast)
          }
        }
      }
    },
    [
      setIsVerifying,
      setKycCompleted,
      setLastVerifiedAccount,
      setCustomerKycInfo,
      openModal,
      removeToast,
      setToast,
    ]
  )

  useEffect(() => {
    if (!isAuthenticated || !address) return

    const normalizedAddress = address.toLowerCase()

    if (latestKycCheckAccountRef.current === normalizedAddress) return

    if (
      state.lastVerifiedAccount &&
      normalizedAddress !== state.lastVerifiedAccount.toLowerCase()
    ) {
      setToast({
        type: 'info',
        title: 'Account change detected',
        message: 'Verifying status of new account...',
        isClosable: false,
      })
    }

    checkUserKyc(address)
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
