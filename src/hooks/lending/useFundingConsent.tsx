import { useAccount, useChainId, useSignMessage } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import useLoanTickets from '@/hooks/lending/useLoanTickets'
import useHandleError from '@/hooks/web3/useHandleError'

import { ModalsKeys } from '@/context/modal/modal.types'

import { FundingConsentReturn } from '@/app/api/loan-tickets/route'
import { LoanTicketDto, LoanTicketStatus } from '@/config/api.lendersAgreement'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import dayjs from '@/dayjs'
import { capitalize } from '@/utils'

const useFundingConsent = () => {
  const account = useAccount()

  const chainId = useChainId()

  const { signMessage } = useSignMessage()

  const handleError = useHandleError()

  const { openModal } = useModalState()

  const { setToast, removeToast } = useToastState()

  const { updateLoanTickets } = useLoanTickets()

  return async (
    poolName: string,
    subsequentTransaction: {
      amount: number
      timestamp: EpochTimeStamp
      endBorrowerID: string
      poolID: string
      trancheID: string
    },
    decision: LoanTicketStatus,
    callback: (newLoanTickets: LoanTicketDto[]) => void
  ) => {
    if (!account.address) {
      return console.error('FundingConsent:: Account is undefined')
    }

    if (!chainId) {
      return console.error('FundingConsent:: ChainId is undefined')
    }

    try {
      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message:
          ACTION_MESSAGES[ActionType.FUNDING_CONSENT][ActionStatus.SIGNING],
        isClosable: false,
      })

      const payload = {
        endBorrowerID: subsequentTransaction.endBorrowerID,
        poolID: subsequentTransaction.poolID,
        trancheID: subsequentTransaction.trancheID,
        status: decision,
      }

      const signatureTimestamp = dayjs().unix() * 1000

      try {
        signMessage(
          {
            message: `I would like to record the following opt-in/out requests: ${JSON.stringify([payload])}, ${signatureTimestamp}`,
          },
          {
            onError: (error) => {
              throw new Error(error.message)
            },
            onSuccess: async (signature) => {
              if (!account.address) {
                return console.error('Funding Consent:: Account is undefiend')
              }

              setToast({
                type: 'info',
                title: capitalize(ActionStatus.PROCESSING),
                message:
                  ACTION_MESSAGES[ActionType.FUNDING_CONSENT][
                    ActionStatus.PROCESSING
                  ],
                isClosable: false,
              })

              const res = await fetch(
                '/api/loan-tickets?' +
                  new URLSearchParams({
                    chainId: chainId.toString(),
                  }),
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userID: account.address.toLowerCase(),
                    payload,
                    signature,
                    signatureTimestamp,
                  }),
                }
              )

              const data: FundingConsentReturn = await res.json()

              if ('statusCode' in data) {
                throw new Error(data.message)
              }
              const loanTickets = await updateLoanTickets(
                (prevData) => [...(prevData || []), ...data],
                {
                  revalidate: false,
                }
              )

              if (loanTickets) {
                callback(loanTickets)
              }

              if (decision === LoanTicketStatus.optedIn) {
                openModal({ name: ModalsKeys.OPT_IN })
              } else {
                openModal({
                  name: ModalsKeys.OPT_OUT,
                  subsequentTransaction,
                  poolName,
                })
              }

              removeToast()
            },
          }
        )
      } catch (error) {
        handleError(
          error,
          capitalize(ActionStatus.REJECTED),
          'Message signature request declined.',
          true
        )
        return
      }
    } catch (error) {
      handleError(error)
    }
  }
}

export default useFundingConsent
