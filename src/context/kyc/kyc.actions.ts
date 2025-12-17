// @ts-ignore export error
import {
  Config,
  getCustomerStatus,
  getIdentityWallets,
  watchWidgetVisibleState,
} from '@compilot/react-sdk'
import { watchIsAuthenticated } from '@compilot/web-sdk'
import { Dispatch, useMemo } from 'react'

import useToastState from '@/hooks/context/useToastState'

import { KycActions, KycFunctions } from '@/context/kyc/kyc.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { capitalize } from '@/utils'

import type { CheckKycRes, CustomerStatus } from '@/types/kyc'

const isKycCompletedStatus = (status: CustomerStatus) =>
  status === 'Active' || status === 'No Email'

const useKycActions = (dispatch: Dispatch<KycActions>): KycFunctions => {
  const { setToast, removeToast } = useToastState()

  return useMemo(
    () => ({
      handleOpenWidget: (
        compilotConfig: Config,
        handleClose: () => void,
        successCallback?: () => void
      ) => {
        setToast({
          type: 'info',
          title: capitalize(ActionStatus.PROCESSING),
          message: 'Waiting for message signature to be signed...',
          isClosable: false,
        })
        watchIsAuthenticated(compilotConfig, {
          onIsAuthenticatedChange: (isAuthenticated) => {
            if (isAuthenticated) {
              setToast({
                type: 'info',
                title: 'Identity Verification in Progress',
                message: 'Waiting for third party provider...',
                isClosable: false,
              })
            }
          },
        })
        watchWidgetVisibleState(compilotConfig, {
          onChange: async (isVisible) => {
            // widget close
            if (!isVisible) {
              const account = await getIdentityWallets(compilotConfig)
              const walletAddress = account[0]?.address
              if (!walletAddress) {
                setToast({
                  type: 'error',
                  title: capitalize(ActionStatus.ERROR),
                  message:
                    'Unable to read your wallet address from the verification session.',
                })
                return
              }

              const fetchKycInfo = async () => {
                try {
                  const res = await fetch(
                    `/api/kyc?${new URLSearchParams({
                      userAddress: walletAddress.toLowerCase(),
                    })}`
                  )

                  if (!res.ok) return null

                  return (await res.json()) as CheckKycRes
                } catch {
                  return null
                }
              }

              const kycInfo = await fetchKycInfo()
              const status: CustomerStatus =
                (kycInfo?.status as CustomerStatus) ??
                (await getCustomerStatus(compilotConfig)) ??
                'No status'

              if (kycInfo) {
                dispatch({
                  type: 'SET_CUSTOMER_STATUS',
                  payload: kycInfo,
                })
              }

              if (
                !isKycCompletedStatus(status) &&
                status !== 'To be reviewed'
              ) {
                if (
                  status === 'Rejected' ||
                  status === 'Failed' ||
                  status === 'Terminated'
                ) {
                  const reason =
                    typeof kycInfo?.reason === 'string' &&
                    kycInfo.reason.trim().length
                      ? ` Reason: ${kycInfo.reason}`
                      : ''

                  setToast({
                    type: 'error',
                    title: capitalize(ActionStatus.REJECTED),
                    message: `Your identity verification was not approved.${reason}`,
                  })

                  return
                }

                setToast({
                  type: 'warning',
                  title: capitalize(ActionStatus.PROCESSING),
                  message:
                    'Identity verification process is not yet completed.',
                })
                return
              }

              if (status === 'To be reviewed') {
                setToast({
                  type: 'warning',
                  title: capitalize(ActionStatus.PROCESSING),
                  message:
                    'Your identity is being reviewed by our team. Please return to this page later.',
                })

                handleClose()
              } else {
                // recursively call setToast to update timer
                let timer = 10 // in seconds

                dispatch({
                  type: 'SET_LAST_VERIFIED_ACCOUNT',
                  payload: walletAddress,
                })

                dispatch({
                  type: 'SET_KYC_COMPLETED',
                  payload: isKycCompletedStatus(status),
                })

                const handleToastClose = (clearInterval?: () => void) => {
                  clearInterval?.()
                  handleClose()
                  successCallback && successCallback()
                }

                const updateTime = (clearInterval?: () => void) => {
                  if (timer === 0) {
                    removeToast()

                    handleToastClose(clearInterval)

                    return
                  }

                  setToast({
                    type: 'success',
                    title: capitalize(
                      `${ActionType.KYC} ${ActionStatus.SUCCESS}`
                    ),
                    message:
                      ACTION_MESSAGES[ActionType.KYC][ActionStatus.SUCCESS](
                        timer
                      ),
                    onCloseCallback: () => handleToastClose(clearInterval),
                  })

                  timer--
                }

                updateTime()

                const interval = setInterval(() => {
                  updateTime(() => clearInterval(interval))
                  return
                }, 1000)
              }
            }
          },
        })
      },
      setLastVerifiedAccount: (account: string) =>
        dispatch({
          type: 'SET_LAST_VERIFIED_ACCOUNT',
          payload: account,
        }),
      setCustomerKycInfo: (customerStatus: {
        type: 'Company' | 'Individual'
        status: CustomerStatus
        canRetry: boolean
        reason?: string | null
      }) => dispatch({ type: 'SET_CUSTOMER_STATUS', payload: customerStatus }),
      setIsVerifying: (isVerifying: boolean) =>
        dispatch({ type: 'SET_IS_VERIFYING', payload: isVerifying }),
      setKycCompleted: (kycCompleted: boolean) =>
        dispatch({ type: 'SET_KYC_COMPLETED', payload: kycCompleted }),
    }),

    [dispatch, removeToast, setToast]
  )
}

export default useKycActions
