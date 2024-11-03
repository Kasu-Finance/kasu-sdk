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

import { CustomerStatus } from '@/actions/checkUserKycState'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { capitalize } from '@/utils'

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
              const status = await getCustomerStatus(compilotConfig)
              const account = await getIdentityWallets(compilotConfig)

              if (status !== 'To be reviewed' && status !== 'Active') {
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
                  type: 'SET_KYC_COMPLETED',
                  payload: account[0].address,
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
      resetAuthenticatedUser: () => dispatch({ type: 'RESET_AUTHENTICATION' }),
      setCustomerStatus: (customerStatus: CustomerStatus) =>
        dispatch({ type: 'SET_CUSTOMER_STATUS', payload: customerStatus }),
      setIsVerifying: (isVerifying: boolean) =>
        dispatch({ type: 'SET_IS_VERIFYING', payload: isVerifying }),
      setKycCompleted: (account: string) =>
        dispatch({ type: 'SET_KYC_COMPLETED', payload: account }),
    }),

    [dispatch, removeToast, setToast]
  )
}

export default useKycActions
